const db = require("./db/config");
const jwt = require("jsonwebtoken");
const config = require("./config");

const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

// 在线用户映射: userId -> Set<socketId>
const onlineUsers = new Map();

function initSocket(io) {
  // JWT 鉴权中间件
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error("未提供认证信息"));
    try {
      const raw = token.startsWith("Bearer ") ? token.slice(7) : token;
      const decoded = jwt.verify(raw, config.jwtSecreKey);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error("认证失败"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user.id;
    const userRole = socket.user.role || "user";
    console.log(`[Socket] 用户 ${userId}(${userRole}) 已连接`);

    // 加入个人房间
    socket.join(`user_${userId}`);

    // 注册在线状态
    if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
    onlineUsers.get(userId).add(socket.id);

    // 如果是客服/管理员, 加入客服房间（新消息推送）
    if (userRole === "admin" || socket.user.is_service) {
      socket.join("service_room");
    }
    // 仅管理员加入管理员房间（新订单、售后等系统通知）
    if (userRole === "admin") {
      socket.join("admin_room");
    }

    // ============ 发送消息 ============
    socket.on("send_message", async (data, callback) => {
      try {
        const { session_id, content, msg_type = "text" } = data;
        if (!session_id || !content) return callback?.({ error: "参数不完整" });

        // 查询会话
        const sessions = await query("SELECT * FROM chat_session WHERE id=?", [session_id]);
        if (sessions.length === 0) return callback?.({ error: "会话不存在" });
        const session = sessions[0];

        // 确定发送者角色
        let senderRole = "user";
        if (userRole === "admin") senderRole = "admin";
        else if (socket.user.is_service) senderRole = "service";
        else if (userId === session.target_id && session.target_type === "seller") senderRole = "seller";

        // 插入消息
        const result = await query("INSERT INTO chat_message SET ?", {
          session_id, sender_id: userId, sender_role: senderRole,
          content, msg_type, is_read: 0,
        });

        // 更新会话
        const isUserSide = userId === session.user_id;
        const unreadField = isUserSide ? "unread_target" : "unread_user";
        await query(
          `UPDATE chat_session SET last_message=?, last_message_time=NOW(), ${unreadField}=${unreadField}+1 WHERE id=?`,
          [content.substring(0, 200), session_id]
        );

        const msg = {
          id: result.insertId, session_id, sender_id: userId,
          sender_role: senderRole, content, msg_type, is_read: 0,
          created_at: new Date().toISOString(),
        };

        // 推送给会话双方
        const targetId = isUserSide ? session.target_id : session.user_id;
        io.to(`user_${targetId}`).emit("new_message", msg);
        // 如果是平台客服会话, 也推送到客服房间
        if (session.target_type === "service") {
          socket.to("service_room").emit("new_message", msg);
        }

        callback?.({ success: true, message: msg });
      } catch (err) {
        console.error("[Socket] send_message error:", err);
        callback?.({ error: "发送失败" });
      }
    });

    // ============ 创建/获取会话 ============
    socket.on("create_session", async (data, callback) => {
      try {
        const { target_id, target_type = "seller" } = data;
        if (!target_id) return callback?.({ error: "参数不完整" });

        // 检查是否已有活跃会话
        const existing = await query(
          "SELECT * FROM chat_session WHERE user_id=? AND target_id=? AND target_type=? AND status='active'",
          [userId, target_id, target_type]
        );
        if (existing.length > 0) return callback?.({ success: true, session: existing[0] });

        const result = await query("INSERT INTO chat_session SET ?", {
          user_id: userId, target_id, target_type, status: "active",
        });
        const session = { id: result.insertId, user_id: userId, target_id, target_type, status: "active" };
        callback?.({ success: true, session });
      } catch (err) {
        console.error("[Socket] create_session error:", err);
        callback?.({ error: "创建会话失败" });
      }
    });

    // ============ 标记已读 ============
    socket.on("mark_read", async (data) => {
      try {
        const { session_id } = data;
        if (!session_id) return;
        await query("UPDATE chat_message SET is_read=1 WHERE session_id=? AND sender_id!=? AND is_read=0",
          [session_id, userId]);
        // 重置未读数
        const sessions = await query("SELECT * FROM chat_session WHERE id=?", [session_id]);
        if (sessions.length > 0) {
          const s = sessions[0];
          const field = userId === s.user_id ? "unread_user" : "unread_target";
          await query(`UPDATE chat_session SET ${field}=0 WHERE id=?`, [session_id]);
        }
      } catch (err) {
        console.error("[Socket] mark_read error:", err);
      }
    });

    // ============ 客服接入会话 ============
    socket.on("assign_session", async (data, callback) => {
      try {
        const { session_id } = data;
        if (userRole !== "admin" && !socket.user.is_service) return callback?.({ error: "无权限" });
        await query("UPDATE chat_session SET assigned_service=? WHERE id=?", [userId, session_id]);
        callback?.({ success: true });
      } catch (err) {
        callback?.({ error: "操作失败" });
      }
    });

    // ============ 输入状态 ============
    socket.on("typing", (data) => {
      const { session_id, target_id } = data;
      if (target_id) io.to(`user_${target_id}`).emit("user_typing", { session_id, user_id: userId });
    });

    // ============ 断开连接 ============
    socket.on("disconnect", () => {
      console.log(`[Socket] 用户 ${userId} 已断开`);
      const sockets = onlineUsers.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) onlineUsers.delete(userId);
      }
    });
  });

  return { io, onlineUsers };
}

module.exports = { initSocket, onlineUsers };
