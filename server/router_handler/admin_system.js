const db = require("../db/config");
const query = (sql, params = []) => new Promise((resolve, reject) => {
  db.query(sql, params, (err, r) => (err ? reject(err) : resolve(r)));
});

// ==================== 基础设置 ====================
exports.getConfigs = async (req, res) => {
  try {
    const list = await query("SELECT * FROM system_config ORDER BY id ASC");
    const configs = {};
    list.forEach(c => { configs[c.config_key] = c.config_value; });
    res.send({ status: 200, data: { list, configs } });
  } catch (err) { res.cc(err); }
};

exports.saveConfigs = async (req, res) => {
  try {
    const { configs } = req.body;
    if (!configs || typeof configs !== "object") return res.cc("参数错误", 400);
    for (const [key, value] of Object.entries(configs)) {
      await query(
        "INSERT INTO system_config (config_key, config_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE config_value=?",
        [key, value, value]
      );
    }
    res.send({ status: 200, message: "保存成功" });
  } catch (err) { res.cc(err); }
};

// ==================== 通知模板 ====================
exports.getNotificationTemplates = async (req, res) => {
  try {
    const list = await query("SELECT * FROM notification_template ORDER BY id ASC");
    res.send({ status: 200, data: list });
  } catch (err) { res.cc(err); }
};

exports.saveNotificationTemplate = async (req, res) => {
  try {
    const { id, name, type, subject, content, variables, status } = req.body;
    if (!name || !content) return res.cc("名称和内容不能为空", 400);
    if (id) {
      await query("UPDATE notification_template SET name=?, type=?, subject=?, content=?, variables=?, status=? WHERE id=?",
        [name, type || "in_app", subject || "", content, variables || "", status, id]);
    } else {
      await query("INSERT INTO notification_template SET ?", {
        name, type: type || "in_app", subject: subject || "",
        content, variables: variables || "", status: status !== undefined ? status : 1,
      });
    }
    res.send({ status: 200, message: "保存成功" });
  } catch (err) { res.cc(err); }
};

exports.deleteNotificationTemplate = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.cc("参数不完整", 400);
    await query("DELETE FROM notification_template WHERE id=?", [id]);
    res.send({ status: 200, message: "删除成功" });
  } catch (err) { res.cc(err); }
};

// ==================== 站内通知 ====================
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.query.user_id || req.auth.id;
    const onlyUnread = req.query.unread === "1";
    let where = "WHERE (user_id=? OR user_id=0)";
    const params = [userId];
    if (onlyUnread) { where += " AND is_read=0"; }
    const list = await query(
      `SELECT * FROM notification ${where} ORDER BY created_at DESC LIMIT 50`, params
    );
    const unreadCount = await query(
      "SELECT COUNT(*) as count FROM notification WHERE (user_id=? OR user_id=0) AND is_read=0", [userId]
    );
    res.send({ status: 200, data: { list, unreadCount: unreadCount[0].count } });
  } catch (err) { res.cc(err); }
};

exports.sendNotification = async (req, res) => {
  try {
    const { user_id, title, content, type } = req.body;
    if (!title) return res.cc("标题不能为空", 400);
    await query("INSERT INTO notification SET ?", {
      user_id: user_id || 0, title, content: content || "", type: type || "system",
    });
    // 如果有 Socket.IO 实例，推送实时通知
    const io = req.app.get("io");
    if (io) {
      const target = user_id ? `user_${user_id}` : null;
      const payload = { title, content, type: type || "system", created_at: new Date() };
      if (target) io.to(target).emit("notification", payload);
      else io.emit("notification", payload);
    }
    res.send({ status: 200, message: "发送成功" });
  } catch (err) { res.cc(err); }
};

exports.markNotificationRead = async (req, res) => {
  try {
    const { id } = req.body;
    const userId = req.auth.id;
    if (id === "all") {
      await query("UPDATE notification SET is_read=1 WHERE (user_id=? OR user_id=0) AND is_read=0", [userId]);
    } else if (id) {
      await query("UPDATE notification SET is_read=1 WHERE id=?", [id]);
    }
    res.send({ status: 200, message: "已标记已读" });
  } catch (err) { res.cc(err); }
};

exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.cc("参数不完整", 400);
    await query("DELETE FROM notification WHERE id=?", [id]);
    res.send({ status: 200, message: "已删除" });
  } catch (err) { res.cc(err); }
};

// ==================== 角色页面权限（存 system_config.role_page_permission） ====================
exports.getRolePagePermission = async (req, res) => {
  try {
    const rows = await query("SELECT config_value FROM system_config WHERE config_key = ?", ["role_page_permission"]);
    let data = { superAdmin: [], operationAdmin: [], customerService: [], user: [] };
    if (rows.length > 0 && rows[0].config_value) {
      try {
        data = JSON.parse(rows[0].config_value);
      } catch (e) { /* 使用默认 */ }
    }
    // 强制兜底：确保客服角色至少能访问“在线咨询/会话管理”页
    if (!Array.isArray(data.customerService)) data.customerService = [];
    if (!data.customerService.includes("/chat-sessions")) data.customerService.push("/chat-sessions");
    if (!data.customerService.includes("/chat-sessions-manage")) data.customerService.push("/chat-sessions-manage");
    // 其它角色数组做一下兜底，避免返回结构异常
    if (!Array.isArray(data.superAdmin)) data.superAdmin = [];
    if (!Array.isArray(data.operationAdmin)) data.operationAdmin = [];
    if (!Array.isArray(data.user)) data.user = [];
    res.send({ status: 200, data });
  } catch (err) { res.cc(err); }
};

exports.saveRolePagePermission = async (req, res) => {
  try {
    const { rolePagePermission } = req.body;
    if (!rolePagePermission || typeof rolePagePermission !== "object") return res.cc("参数错误", 400);
    const value = JSON.stringify(rolePagePermission);
    const updated = await query("UPDATE system_config SET config_value = ? WHERE config_key = ?", [value, "role_page_permission"]);
    if (updated.affectedRows === 0) {
      await query("INSERT INTO system_config (config_key, config_value) VALUES (?, ?)", ["role_page_permission", value]);
    }
    res.send({ status: 200, message: "保存成功" });
  } catch (err) { res.cc(err); }
};
