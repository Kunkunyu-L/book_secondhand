const db = require("../db/config");
const query = (sql, params = []) => new Promise((resolve, reject) => {
  db.query(sql, params, (err, r) => (err ? reject(err) : resolve(r)));
});

// ==================== 公告管理 ====================
exports.getAnnouncements = async (req, res) => {
  try {
    const type = req.query.type || "";
    const status = req.query.status;
    const conditions = [];
    const params = [];
    if (type) { conditions.push("type=?"); params.push(type); }
    if (status !== undefined && status !== "") { conditions.push("status=?"); params.push(Number(status)); }
    let sql = "SELECT * FROM announcement";
    if (conditions.length > 0) sql += " WHERE " + conditions.join(" AND ");
    sql += " ORDER BY sort DESC, created_at DESC";
    const list = await query(sql, params);
    res.send({ status: 200, data: list });
  } catch (err) { res.cc(err); }
};

exports.addAnnouncement = async (req, res) => {
  try {
    const { title, content, type, status, sort } = req.body;
    if (!title) return res.cc("标题不能为空", 400);
    await query("INSERT INTO announcement SET ?", {
      title, content: content || "", type: type || "notice",
      status: status !== undefined ? status : 1, sort: sort || 0, admin_id: req.auth.id,
      created_at: new Date(),
    });
    res.send({ status: 200, message: "添加成功" });
  } catch (err) { res.cc(err); }
};

exports.updateAnnouncement = async (req, res) => {
  try {
    const { id, title, content, type, status, sort } = req.body;
    if (!id) return res.cc("参数不完整", 400);
    await query("UPDATE announcement SET title=?, content=?, type=?, status=?, sort=? WHERE id=?",
      [title, content || "", type || "notice", status, sort || 0, id]);
    res.send({ status: 200, message: "更新成功" });
  } catch (err) { res.cc(err); }
};

exports.deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.cc("参数不完整", 400);
    await query("DELETE FROM announcement WHERE id=?", [id]);
    res.send({ status: 200, message: "删除成功" });
  } catch (err) { res.cc(err); }
};

// ==================== 帮助文档管理 ====================
exports.getHelpArticles = async (req, res) => {
  try {
    const category = req.query.category || "";
    let where = "WHERE 1=1";
    const params = [];
    if (category) { where += " AND category=?"; params.push(category); }
    const list = await query(`SELECT * FROM help_article ${where} ORDER BY sort DESC, created_at DESC`, params);
    res.send({ status: 200, data: list });
  } catch (err) { res.cc(err); }
};

exports.addHelpArticle = async (req, res) => {
  try {
    const { title, content, category, sort, status } = req.body;
    if (!title) return res.cc("标题不能为空", 400);
    await query("INSERT INTO help_article SET ?", {
      title, content: content || "", category: category || "guide",
      sort: sort || 0, status: status !== undefined ? status : 1,
    });
    res.send({ status: 200, message: "添加成功" });
  } catch (err) { res.cc(err); }
};

exports.updateHelpArticle = async (req, res) => {
  try {
    const { id, title, content, category, sort, status } = req.body;
    if (!id) return res.cc("参数不完整", 400);
    await query("UPDATE help_article SET title=?, content=?, category=?, sort=?, status=? WHERE id=?",
      [title, content || "", category || "guide", sort || 0, status, id]);
    res.send({ status: 200, message: "更新成功" });
  } catch (err) { res.cc(err); }
};

exports.deleteHelpArticle = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.cc("参数不完整", 400);
    await query("DELETE FROM help_article WHERE id=?", [id]);
    res.send({ status: 200, message: "删除成功" });
  } catch (err) { res.cc(err); }
};

// ==================== 轮播图管理 ====================
exports.getBanners = async (req, res) => {
  try {
    const list = await query("SELECT * FROM banner ORDER BY sort DESC, id ASC");
    res.send({ status: 200, data: list });
  } catch (err) { res.cc(err); }
};

exports.addBanner = async (req, res) => {
  try {
    const { image_url, link_url, title, sort, status } = req.body;
    if (!image_url) return res.cc("图片地址不能为空", 400);
    await query("INSERT INTO banner SET ?", {
      image_url, link_url: link_url || "", title: title || "",
      sort: sort || 0, status: status !== undefined ? status : 1,
    });
    res.send({ status: 200, message: "添加成功" });
  } catch (err) { res.cc(err); }
};

exports.updateBanner = async (req, res) => {
  try {
    const { id, image_url, link_url, title, sort, status } = req.body;
    if (!id) return res.cc("参数不完整", 400);
    await query("UPDATE banner SET image_url=?, link_url=?, title=?, sort=?, status=? WHERE id=?",
      [image_url, link_url || "", title || "", sort || 0, status, id]);
    res.send({ status: 200, message: "更新成功" });
  } catch (err) { res.cc(err); }
};

exports.deleteBanner = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.cc("参数不完整", 400);
    await query("DELETE FROM banner WHERE id=?", [id]);
    res.send({ status: 200, message: "删除成功" });
  } catch (err) { res.cc(err); }
};
