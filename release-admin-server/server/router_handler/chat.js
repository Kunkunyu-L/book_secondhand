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
      data: { list: messages.reverse(), total: countResult[0].total },
    });
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
