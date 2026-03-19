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
      sql = `SELECT cs.*,
          CASE WHEN cs.target_type='seller' THEN su.nickname ELSE '平台客服' END as target_name,
          CASE WHEN cs.target_type='seller' THEN su.avatar ELSE '' END as target_avatar
        FROM chat_session cs
        LEFT JOIN user su ON cs.target_id = su.id
        WHERE cs.user_id = ?
        ORDER BY cs.last_message_time DESC`;
      params = [userId];
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
      ORDER BY cm.created_at DESC LIMIT ? OFFSET ?`,
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
        const isUserSide = userId === session.user_id;
        const targetId = isUserSide ? session.target_id : session.user_id;
        io.to(`user_${targetId}`).emit("new_message", msg);
        if (session.target_type === "service") {
          io.to("service_room").emit("new_message", msg);
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
    // 联系客服时 target_id 为 0 表示平台客服，0 是合法值
    const tid = target_type === "service" ? (Number(req.body.target_id) || 0) : (req.body.target_id);
    if (tid === undefined || tid === null || (target_type === "seller" && !tid))
      return res.cc("参数不完整", 400);

    const existing = await query(
      "SELECT * FROM chat_session WHERE user_id=? AND target_id=? AND target_type=? AND status='active'",
      [userId, tid, target_type]
    );
    if (existing.length > 0) return res.send({ status: 200, data: existing[0] });

    const result = await query("INSERT INTO chat_session SET ?", {
      user_id: userId, target_id: tid, target_type, status: "active",
    });
    res.send({ status: 200, message: "创建成功", data: { id: result.insertId, user_id: userId, target_id: tid, target_type } });
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
