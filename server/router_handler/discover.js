const db = require("../db/config");

// 帖子列表（分页，按时间倒序；my=1 时仅当前用户帖子，需登录）
exports.getPosts = (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize) || 10));
  const offset = (page - 1) * pageSize;
  const whereClause = "p.status = 1";
  const countWhere = "status = 1";
  const sql = `
    SELECT p.id, p.user_id, p.content, p.images, p.like_count, p.comment_count, p.create_time,
           u.nickname, u.avatar
    FROM discover_post p
    LEFT JOIN \`user\` u ON p.user_id = u.id
    WHERE ${whereClause}
    ORDER BY p.create_time DESC
    LIMIT ? OFFSET ?
  `;
  const countSql = "SELECT COUNT(*) AS total FROM discover_post WHERE " + countWhere;
  db.query(countSql, (err, countRes) => {
    if (err) return res.cc(err);
    const total = countRes[0].total;
    db.query(sql, [pageSize, offset], (err, results) => {
      if (err) return res.cc(err);
      res.send({ status: 200, message: "获取成功", data: results, total });
    });
  });
};

// 我发布的帖子（需登录）
exports.getMyPosts = (req, res) => {
  const userId = req.auth.id;
  const sql = `
    SELECT id, user_id, content, images, like_count, comment_count, create_time
    FROM discover_post
    WHERE user_id = ? AND status = 1
    ORDER BY create_time DESC
  `;
  db.query(sql, [userId], (err, results) => {
    if (err) return res.cc(err);
    res.send({ status: 200, data: results });
  });
};

// 发帖（需登录）
exports.createPost = (req, res) => {
  const userId = req.auth.id;
  const { content, images } = req.body;
  if (!content || !String(content).trim()) return res.cc("内容不能为空", 400);
  const sql = "INSERT INTO discover_post (user_id, content, images, create_time) VALUES (?, ?, ?, NOW())";
  const imgStr = Array.isArray(images) ? images.join(",") : (images || "");
  db.query(sql, [userId, String(content).trim(), imgStr], (err, result) => {
    if (err) return res.cc(err);
    res.send({ status: 200, message: "发布成功", data: { id: result.insertId } });
  });
};

// 点赞/取消点赞（需登录）
exports.toggleLike = (req, res) => {
  const userId = req.auth.id;
  const postId = parseInt(req.params.id, 10);
  if (!postId) return res.cc("参数错误", 400);
  const selSql = "SELECT id FROM discover_post_like WHERE post_id=? AND user_id=?";
  db.query(selSql, [postId, userId], (err, rows) => {
    if (err) return res.cc(err);
    const hasLiked = rows.length > 0;
    if (hasLiked) {
      db.query("DELETE FROM discover_post_like WHERE post_id=? AND user_id=?", [postId, userId], (err2) => {
        if (err2) return res.cc(err2);
        db.query("UPDATE discover_post SET like_count = GREATEST(0, like_count - 1) WHERE id=?", [postId], () => {});
        res.send({ status: 200, message: "已取消点赞", data: { liked: false } });
      });
    } else {
      db.query("INSERT INTO discover_post_like (post_id, user_id, create_time) VALUES (?, ?, NOW())", [postId, userId], (err2) => {
        if (err2) return res.cc(err2);
        db.query("UPDATE discover_post SET like_count = like_count + 1 WHERE id=?", [postId], () => {});
        res.send({ status: 200, message: "点赞成功", data: { liked: true } });
      });
    }
  });
};

// 某帖是否已点赞（需登录）
exports.checkLiked = (req, res) => {
  const userId = req.auth.id;
  const postId = parseInt(req.params.id, 10);
  if (!postId) return res.cc("参数错误", 400);
  db.query("SELECT id FROM discover_post_like WHERE post_id=? AND user_id=?", [postId, userId], (err, rows) => {
    if (err) return res.cc(err);
    res.send({ status: 200, data: { liked: rows.length > 0 } });
  });
};

// 评论列表（公开）
exports.getComments = (req, res) => {
  const postId = parseInt(req.params.id, 10);
  if (!postId) return res.cc("参数错误", 400);
  const sql = `
    SELECT c.id, c.post_id, c.user_id, c.reply_to_id, c.content, c.create_time,
           u.nickname, u.avatar
    FROM discover_post_comment c
    LEFT JOIN \`user\` u ON c.user_id = u.id
    WHERE c.post_id = ? AND c.status = 1
    ORDER BY c.create_time ASC
  `;
  db.query(sql, [postId], (err, results) => {
    if (err) return res.cc(err);
    res.send({ status: 200, data: results });
  });
};

// 发表评论（需登录）
exports.createComment = (req, res) => {
  const userId = req.auth.id;
  const postId = parseInt(req.params.id, 10);
  const { content, reply_to_id } = req.body;
  if (!postId || !content || !String(content).trim()) return res.cc("参数错误", 400);
  const sql = "INSERT INTO discover_post_comment (post_id, user_id, reply_to_id, content, create_time) VALUES (?, ?, ?, ?, NOW())";
  const replyId = reply_to_id ? parseInt(reply_to_id, 10) : null;
  db.query(sql, [postId, userId, replyId, String(content).trim()], (err, result) => {
    if (err) return res.cc(err);
    db.query("UPDATE discover_post SET comment_count = comment_count + 1 WHERE id=?", [postId], () => {});
    res.send({ status: 200, message: "评论成功", data: { id: result.insertId } });
  });
}
