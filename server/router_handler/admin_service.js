const db = require("../db/config");
const query = (sql, params = []) => new Promise((resolve, reject) => {
  db.query(sql, params, (err, r) => (err ? reject(err) : resolve(r)));
});

// ==================== 在线咨询会话 ====================
exports.getChatSessions = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 20));
    const offset = (page - 1) * pageSize;
    const status = req.query.status || "";
    const keyword = req.query.keyword || "";

    let where = "WHERE 1=1";
    const params = [];
    if (status && status !== "all") { where += " AND cs.status=?"; params.push(status); }
    if (keyword) {
      where += " AND (u.username LIKE ? OR u.nickname LIKE ?)";
      const kw = `%${keyword}%`; params.push(kw, kw);
    }
    const mode = req.query.mode || "chat"; // chat=在线咨询列表；manage=会话管理列表

    // 可见性规则：
    // - customerService/operationAdmin：
    //   - mode=chat：seller 直聊仅当已分配自己（assigned_service=self）才可见
    //   - mode=manage：会话管理需要能看到未分配的 seller，才能完成分配
    // - 其它角色（如 superAdmin）：不做 seller assigned_service 过滤
    const role = req.auth?.role;
    if ((role === "customerService" || role === "operationAdmin") && mode === "chat") {
      where += " AND (cs.target_type='service' OR cs.assigned_service=?)";
      params.push(req.auth.id);
    }

    const countR = await query(`SELECT COUNT(*) as total FROM chat_session cs LEFT JOIN user u ON cs.user_id=u.id ${where}`, params);
    const list = await query(
      `SELECT cs.*, u.username, u.nickname, u.avatar,
        tu.username as target_username, tu.nickname as target_nickname,
        su.nickname as service_name
      FROM chat_session cs
      LEFT JOIN user u ON cs.user_id=u.id
      LEFT JOIN user tu ON cs.target_id=tu.id
      LEFT JOIN user su ON cs.assigned_service=su.id
      ${where} ORDER BY cs.last_message_time DESC LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );
    res.send({ status: 200, data: { list, total: countR[0].total, page, pageSize } });
  } catch (err) { res.cc(err); }
};

exports.assignSession = async (req, res) => {
  try {
    const { session_id, service_id } = req.body;
    if (!session_id || !service_id) return res.cc("参数不完整", 400);
    await query("UPDATE chat_session SET assigned_service=? WHERE id=?", [service_id, session_id]);
    res.send({ status: 200, message: "分配成功" });
  } catch (err) { res.cc(err); }
};

exports.closeSession = async (req, res) => {
  try {
    const { session_id } = req.body;
    if (!session_id) return res.cc("参数不完整", 400);
    await query("UPDATE chat_session SET status='closed' WHERE id=?", [session_id]);
    res.send({ status: 200, message: "会话已关闭" });
  } catch (err) { res.cc(err); }
};

// ==================== 工单管理 ====================
exports.getTickets = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 10));
    const offset = (page - 1) * pageSize;
    const ticketStatus = req.query.status || "";
    const keyword = req.query.keyword || "";

    let where = "WHERE 1=1";
    const params = [];
    if (ticketStatus && ticketStatus !== "all") { where += " AND t.status=?"; params.push(ticketStatus); }
    if (keyword) {
      where += " AND (t.title LIKE ? OR t.ticket_no LIKE ? OR t.order_no LIKE ? OR u.username LIKE ?)";
      const kw = `%${keyword}%`; params.push(kw, kw, kw, kw);
    }

    const countR = await query(`SELECT COUNT(*) as total FROM service_ticket t LEFT JOIN user u ON t.user_id=u.id ${where}`, params);
    const list = await query(
      `SELECT t.*, u.username, u.nickname,
        COALESCE(au.nickname, ad.nickname) as assigned_name, ad.nickname as admin_name
      FROM service_ticket t
      LEFT JOIN user u ON t.user_id=u.id
      LEFT JOIN user au ON t.assigned_to=au.id
      LEFT JOIN user ad ON t.admin_id=ad.id
      ${where} ORDER BY
        FIELD(t.status, 'pending','processing','resolved','closed'),
        FIELD(t.priority, 'urgent','high','normal','low'),
        COALESCE(t.created_at, t.updated_at) DESC LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );
    res.send({ status: 200, data: { list, total: countR[0].total, page, pageSize } });
  } catch (err) { res.cc(err); }
};

exports.updateTicket = async (req, res) => {
  try {
    const { id, status, reply, assigned_to, priority } = req.body;
    if (!id) return res.cc("参数不完整", 400);
    const updates = [];
    const params = [];
    if (status) { updates.push("status=?"); params.push(status); }
    if (reply !== undefined) { updates.push("reply=?"); params.push(reply); }
    // 管理端“处理工单”入口通常不会传 assigned_to，这里默认把工单分配给当前处理人
    if (assigned_to !== undefined) { updates.push("assigned_to=?"); params.push(assigned_to); }
    else { updates.push("assigned_to=?"); params.push(req.auth.id); }
    if (priority) { updates.push("priority=?"); params.push(priority); }
    updates.push("admin_id=?"); params.push(req.auth.id);
    params.push(id);
    await query(`UPDATE service_ticket SET ${updates.join(",")} WHERE id=?`, params);
    res.send({ status: 200, message: "更新成功" });
  } catch (err) { res.cc(err); }
};

// FAQ 列表（按关键字 / 分类筛选）
exports.getFaqs = async (req, res) => {
  try {
    const keyword = req.query.keyword || "";
    const category = req.query.category || "";
    let where = "WHERE 1=1";
    const params = [];
    if (category) { where += " AND f.category=?"; params.push(category); }
    if (keyword) {
      where += " AND (f.question LIKE ? OR f.answer LIKE ?)";
      const kw = `%${keyword}%`; params.push(kw, kw);
    }
    const list = await query(
      `SELECT f.*, f.category AS category_name FROM faq f
      ${where} ORDER BY f.sort DESC, f.created_at DESC`, params
    );
    res.send({ status: 200, data: list });
  } catch (err) { res.cc(err); }
};

exports.saveFaq = async (req, res) => {
  try {
    const { id, category, question, answer, sort, status } = req.body;
    if (!question || !answer) return res.cc("问题和回答不能为空", 400);
    if (id) {
      await query("UPDATE faq SET category=?, question=?, answer=?, sort=?, status=? WHERE id=?",
        [category || null, question, answer, sort || 0, status, id]);
    } else {
      await query("INSERT INTO faq SET ?", {
        category: category || null, question, answer, sort: sort || 0, status: status !== undefined ? status : 1,
      });
    }
    res.send({ status: 200, message: "保存成功" });
  } catch (err) { res.cc(err); }
};

exports.deleteFaq = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.cc("参数不完整", 400);
    await query("DELETE FROM faq WHERE id=?", [id]);
    res.send({ status: 200, message: "删除成功" });
  } catch (err) { res.cc(err); }
};

// ==================== FAQ 分类（兼容接口，占位实现） ====================
// 目前 FAQ 表本身就包含 category 字段，这里简单根据去重分类返回列表，满足管理端接口约定。
exports.getFaqCategories = async (req, res) => {
  try {
    const list = await query("SELECT DISTINCT category AS name FROM faq WHERE category IS NOT NULL AND category<>'' ORDER BY name ASC");
    res.send({ status: 200, data: list });
  } catch (err) { res.cc(err); }
};

// FAQ 分类保存 / 删除：为了兼容路由，这里仅做占位，前端目前并未使用独立分类管理。
exports.saveFaqCategory = async (req, res) => {
  res.send({ status: 200, message: "ok" });
};

exports.deleteFaqCategory = async (req, res) => {
  res.send({ status: 200, message: "ok" });
};

// ==================== 客服人员管理 ====================
exports.getServiceStaff = async (req, res) => {
  try {
    const list = await query(
      `SELECT u.id, u.username, u.nickname, u.avatar, u.phone, u.is_service,
        u.service_max_sessions, u.status, u.created_at,
        (SELECT COUNT(*) FROM chat_session cs WHERE cs.assigned_service=u.id AND cs.status='active') as active_sessions
      FROM user u WHERE u.is_service=1 OR u.role IN ('superAdmin','operationAdmin','customerService')
      ORDER BY u.created_at DESC`
    );
    res.send({ status: 200, data: list });
  } catch (err) { res.cc(err); }
};

exports.updateServiceStaff = async (req, res) => {
  try {
    const { user_id, is_service, service_max_sessions } = req.body;
    if (!user_id) return res.cc("参数不完整", 400);
    const updates = [];
    const params = [];
    if (is_service !== undefined) { updates.push("is_service=?"); params.push(is_service); }
    if (service_max_sessions !== undefined) { updates.push("service_max_sessions=?"); params.push(service_max_sessions); }
    if (updates.length === 0) return res.cc("无更新内容", 400);
    params.push(user_id);
    await query(`UPDATE user SET ${updates.join(",")} WHERE id=?`, params);
    res.send({ status: 200, message: "更新成功" });
  } catch (err) { res.cc(err); }
};

// ==================== 客服话术管理 ====================
exports.getQuickReplies = async (req, res) => {
  try {
    const keyword = req.query.keyword || "";
    const category = req.query.category || "";
    let where = "WHERE 1=1";
    const params = [];
    if (category) { where += " AND qr.category=?"; params.push(category); }
    if (keyword) {
      where += " AND (qr.title LIKE ? OR qr.content LIKE ?)";
      const kw = `%${keyword}%`; params.push(kw, kw);
    }
    const list = await query(
      `SELECT qr.*, qr.category AS category_name FROM quick_reply qr
      ${where} ORDER BY qr.sort DESC, qr.created_at DESC`, params
    );
    res.send({ status: 200, data: list });
  } catch (err) { res.cc(err); }
};

// ==================== 话术分类（兼容接口，占位实现） ====================
exports.getQuickReplyCategories = async (req, res) => {
  try {
    const list = await query(
      "SELECT DISTINCT category AS name FROM quick_reply WHERE category IS NOT NULL AND category<>'' ORDER BY name ASC"
    );
    res.send({ status: 200, data: list });
  } catch (err) { res.cc(err); }
};

exports.saveQuickReplyCategory = async (req, res) => {
  res.send({ status: 200, message: "ok" });
};

exports.deleteQuickReplyCategory = async (req, res) => {
  res.send({ status: 200, message: "ok" });
};

exports.saveQuickReply = async (req, res) => {
  try {
    const { id, category, title, content, sort } = req.body;
    if (!title || !content) return res.cc("标题和内容不能为空", 400);
    if (id) {
      await query("UPDATE quick_reply SET category=?, title=?, content=?, sort=? WHERE id=?",
        [category || null, title, content, sort || 0, id]);
    } else {
      await query("INSERT INTO quick_reply SET ?", { category: category || null, title, content, sort: sort || 0 });
    }
    res.send({ status: 200, message: "保存成功" });
  } catch (err) { res.cc(err); }
};

exports.deleteQuickReply = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.cc("参数不完整", 400);
    await query("DELETE FROM quick_reply WHERE id=?", [id]);
    res.send({ status: 200, message: "删除成功" });
  } catch (err) { res.cc(err); }
};
