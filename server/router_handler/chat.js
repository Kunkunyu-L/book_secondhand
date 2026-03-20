const db = require("../db/config");

const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

// 获取用户的会话列表
exports.getSessions = async (req, res) => {
  try {
    const userId = req.auth.id;
    const role = req.query.role || "user"; // user=买家视角, seller=卖家视角, service=客服视角

    let sql, params;
    if (role === "service") {
      // 客服看所有平台客服会话
      sql = `SELECT cs.*, u.username, u.nickname, u.avatar
        FROM chat_session cs
        LEFT JOIN user u ON cs.user_id = u.id
        WHERE cs.target_type = 'service'
        ORDER BY cs.last_message_time DESC`;
      params = [];
    } else if (role === "seller") {
      sql = `SELECT cs.*, u.username, u.nickname, u.avatar
        FROM chat_session cs
        LEFT JOIN user u ON cs.user_id = u.id
        WHERE cs.target_id = ? AND cs.target_type = 'seller'
        ORDER BY cs.last_message_time DESC`;
      params = [userId];
    } else {
      // 默认：让“当前登录用户”同时看到自己发起( cs.user_id )以及作为对话另一端( cs.target_id )的直聊会话
      // 同时对 unread_user / target_name 做归一，保证前端统一使用：
      // - unread_user：始终代表“当前登录用户”的未读数
      // - target_name：始终代表“对话对方”的昵称
      sql = `
        SELECT
          cs.*,
          CASE
            WHEN cs.target_type='seller' AND cs.user_id=? THEN su.nickname
            WHEN cs.target_type='seller' AND cs.target_id=? THEN ub.nickname
            ELSE '平台客服'
          END as target_name,
          CASE
            WHEN cs.target_type='seller' AND cs.user_id=? THEN su.avatar
            WHEN cs.target_type='seller' AND cs.target_id=? THEN ub.avatar
            ELSE ''
          END as target_avatar,
          CASE
            WHEN cs.user_id=? THEN COALESCE(cs.unread_user,0)
            WHEN cs.target_type='seller' AND cs.target_id=? THEN COALESCE(cs.unread_target,0)
            ELSE COALESCE(cs.unread_user,0)
          END as unread_user
        FROM chat_session cs
        LEFT JOIN user su ON cs.target_id = su.id
        LEFT JOIN user ub ON cs.user_id = ub.id
        WHERE cs.user_id=?
           OR (cs.target_type='seller' AND cs.target_id=?)
        ORDER BY cs.last_message_time DESC
      `;
      params = [userId, userId, userId, userId, userId, userId, userId, userId];
    }

    const sessions = await query(sql, params);
    res.send({ status: 200, message: "获取会话列表成功", data: sessions });
  } catch (err) {
    res.cc(err);
  }
};

// 获取会话消息记录
exports.getMessages = async (req, res) => {
  try {
    const { session_id, page = 1, pageSize = 30 } = req.query;
    if (!session_id) return res.cc("缺少参数", 400);

    const offset = (Math.max(1, Number(page)) - 1) * Number(pageSize);
    const countResult = await query("SELECT COUNT(*) as total FROM chat_message WHERE session_id=?", [session_id]);
    const messages = await query(
      `SELECT cm.*, u.nickname as sender_name, u.avatar as sender_avatar
      FROM chat_message cm LEFT JOIN user u ON cm.sender_id = u.id
      WHERE cm.session_id = ?
      ORDER BY cm.id DESC LIMIT ? OFFSET ?`,
      [session_id, Number(pageSize), offset]
    );

    res.send({
      status: 200, message: "获取消息成功",
      data: { list: messages, total: countResult[0].total },
    });
  } catch (err) {
    res.cc(err);
  }
};

// 通过 REST 接口发送消息（Socket 失败时的兜底）
exports.postMessage = async (req, res) => {
  try {
    const userId = req.auth.id;
    const userRole = req.auth.role || "user";
    const { session_id, content, msg_type = "text" } = req.body || {};
    if (!session_id || !content) return res.cc("缺少参数", 400);

    const sessions = await query("SELECT * FROM chat_session WHERE id=?", [session_id]);
    if (sessions.length === 0) return res.cc("会话不存在", 404);
    const session = sessions[0];

    let senderRole = "user";
    if (["superAdmin", "operationAdmin", "customerService"].includes(userRole)) senderRole = "admin";
    else if (req.auth.is_service) senderRole = "service";
    else if (userId === session.target_id && session.target_type === "seller") senderRole = "seller";

    const result = await query("INSERT INTO chat_message SET ?", {
      session_id,
      sender_id: userId,
      sender_role: senderRole,
      content,
      msg_type,
      is_read: 0,
      // 数据库的 created_at 在建表里默认 NULL，如果不写入会导致排序/分页基于 NULL 不稳定
      created_at: new Date(),
    });

    const isUserSide = userId === session.user_id;
    const unreadField = isUserSide ? "unread_target" : "unread_user";
    await query(
      `UPDATE chat_session SET last_message=?, last_message_time=NOW(), ${unreadField}=${unreadField}+1 WHERE id=?`,
      [content.substring(0, 200), session_id]
    );

    const msg = {
      id: result.insertId,
      session_id,
      sender_id: userId,
      sender_role: senderRole,
      content,
      msg_type,
      is_read: 0,
      created_at: new Date().toISOString(),
    };

    // 尝试通过 Socket 推送给对端（方便后台/客服实时看到）
    try {
      const io = req.app.get("io");
      if (io) {
        // 推送接收方：
        // - target_type='seller'：会话双方（user_id 与 target_id）都要收到（包含客服/管理员代发时）
        // - target_type='service'：target_id 通常为 0，只推给 session.user_id
        const recipients = new Set();

        if (session.target_type === "seller") {
          const u1 = session.user_id;
          const u2 = session.target_id;
          if (String(userId) === String(u1)) {
            if (u2) recipients.add(u2);
          } else if (String(userId) === String(u2)) {
            if (u1) recipients.add(u1);
          } else {
            // sender 不是会话两端（例如客服/管理员代发）
            if (u1) recipients.add(u1);
            if (u2) recipients.add(u2);
          }
        } else {
          if (session.user_id) recipients.add(session.user_id);
        }

        for (const uid of recipients) {
          io.to(`user_${uid}`).emit("new_message", msg);
        }

        // 仅推送给“已分配客服”（客服侧实时刷新）
        if (session.assigned_service) {
          io.to(`user_${session.assigned_service}`).emit("new_message", msg);

          // 写入通知（仅发给已分配客服）
          if (senderRole === "user" && session.target_type === "service") {
            await query(
              "INSERT INTO notification (user_id, title, content, type) VALUES (?, ?, ?, 'message')",
              [session.assigned_service, "新客服消息", "有用户发来客服消息，请及时回复"]
            ).catch(() => {});
          }
        }
      }
    } catch (e) {
      // 推送异常仅记录日志，不影响接口返回
      // console.error("postMessage emit error:", e);
    }

    res.send({ status: 200, message: "发送成功", data: msg });
  } catch (err) {
    res.cc(err);
  }
};

// 创建会话（REST方式）
exports.createSession = async (req, res) => {
  try {
    const userId = req.auth.id;
    const { target_id, target_type = "seller" } = req.body;
    // 联系平台客服时 target_id 为 0 表示平台客服，0 是合法值
    // 容错：如果前端把用户-用户会话误传成 target_type='service'，但 target_id != 0，则归一为 seller
    const rawTargetIdNum = Number(target_id);
    let normalizedTargetType = target_type;
    if (target_type === "service" && rawTargetIdNum && rawTargetIdNum !== 0) {
      normalizedTargetType = "seller";
    }

    const tid =
      normalizedTargetType === "service"
        ? (Number(target_id) || 0)
        : target_id;

    if (tid === undefined || tid === null || (normalizedTargetType === "seller" && !tid)) {
      return res.cc("参数不完整", 400);
    }

    const existing = await query(
      "SELECT * FROM chat_session WHERE user_id=? AND target_id=? AND target_type=? AND status='active'",
      [userId, tid, normalizedTargetType]
    );
    if (existing.length > 0) return res.send({ status: 200, data: existing[0] });

    const result = await query("INSERT INTO chat_session SET ?", {
      user_id: userId, target_id: tid, target_type: normalizedTargetType, status: "active",
    });
    res.send({
      status: 200,
      message: "创建成功",
      data: { id: result.insertId, user_id: userId, target_id: tid, target_type: normalizedTargetType },
    });
  } catch (err) {
    res.cc(err);
  }
};

// 删除会话（用户从列表隐藏，不删除消息记录）
exports.deleteSession = async (req, res) => {
  try {
    const userId = req.auth.id;
    const { session_id } = req.body;
    if (!session_id) return res.cc("缺少参数", 400);
    const rows = await query("SELECT id FROM chat_session WHERE id=? AND user_id=?", [session_id, userId]);
    if (rows.length === 0) return res.cc("会话不存在或无权限", 403);
    await query("DELETE FROM chat_session WHERE id=? AND user_id=?", [session_id, userId]);
    res.send({ status: 200, message: "删除成功" });
  } catch (err) {
    res.cc(err);
  }
};
