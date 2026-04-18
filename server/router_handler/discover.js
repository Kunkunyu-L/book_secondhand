const db = require("../db/config");

// Public post list
exports.getPosts = (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize, 10) || 10));
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
    db.query(sql, [pageSize, offset], (listErr, results) => {
      if (listErr) return res.cc(listErr);
      res.send({ status: 200, message: "ok", data: results, total });
    });
  });
};

// Current user's posts
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
    res.send({ status: 200, data: results || [] });
  });
};

// Create post
exports.createPost = (req, res) => {
  const userId = req.auth.id;
  const { content, images } = req.body || {};
  const trimContent = String(content || "").trim();
  if (!trimContent) return res.cc("内容不能为空", 400);

  const sql = "INSERT INTO discover_post (user_id, content, images, create_time) VALUES (?, ?, ?, NOW())";
  const imgStr = Array.isArray(images) ? images.join(",") : (images || "");
  db.query(sql, [userId, trimContent, imgStr], (err, result) => {
    if (err) return res.cc(err);
    res.send({ status: 200, message: "发布成功", data: { id: result.insertId } });
  });
};

// Update current user's post
exports.updateMyPost = (req, res) => {
  const userId = req.auth.id;
  const { id, content, images } = req.body || {};
  const postId = parseInt(id, 10);
  const trimContent = String(content || "").trim();
  if (!postId || !trimContent) return res.cc("参数不完整", 400);

  const checkSql = "SELECT id FROM discover_post WHERE id=? AND user_id=? AND status=1 LIMIT 1";
  db.query(checkSql, [postId, userId], (checkErr, rows) => {
    if (checkErr) return res.cc(checkErr);
    if (!rows || rows.length === 0) return res.cc("帖子不存在或无权限", 404);

    const imgStr = Array.isArray(images) ? images.join(",") : (images || "");
    const updateSql = "UPDATE discover_post SET content=?, images=? WHERE id=? AND user_id=?";
    db.query(updateSql, [trimContent, imgStr, postId, userId], (updateErr) => {
      if (updateErr) return res.cc(updateErr);
      res.send({ status: 200, message: "修改成功" });
    });
  });
};

// Toggle like
exports.toggleLike = (req, res) => {
  const userId = req.auth.id;
  const postId = parseInt(req.params.id, 10);
  if (!postId) return res.cc("参数错误", 400);

  const selectSql = "SELECT id FROM discover_post_like WHERE post_id=? AND user_id=?";
  db.query(selectSql, [postId, userId], (err, rows) => {
    if (err) return res.cc(err);
    const hasLiked = rows.length > 0;

    if (hasLiked) {
      db.query("DELETE FROM discover_post_like WHERE post_id=? AND user_id=?", [postId, userId], (delErr) => {
        if (delErr) return res.cc(delErr);
        db.query("UPDATE discover_post SET like_count = GREATEST(0, like_count - 1) WHERE id=?", [postId], () => {});
        res.send({ status: 200, message: "取消点赞", data: { liked: false } });
      });
    } else {
      db.query(
        "INSERT INTO discover_post_like (post_id, user_id, create_time) VALUES (?, ?, NOW())",
        [postId, userId],
        (insErr) => {
          if (insErr) return res.cc(insErr);
          db.query("UPDATE discover_post SET like_count = like_count + 1 WHERE id=?", [postId], () => {});
          res.send({ status: 200, message: "点赞成功", data: { liked: true } });
        }
      );
    }
  });
};

// Is post liked by current user
exports.checkLiked = (req, res) => {
  const userId = req.auth.id;
  const postId = parseInt(req.params.id, 10);
  if (!postId) return res.cc("参数错误", 400);

  db.query("SELECT id FROM discover_post_like WHERE post_id=? AND user_id=?", [postId, userId], (err, rows) => {
    if (err) return res.cc(err);
    res.send({ status: 200, data: { liked: rows.length > 0 } });
  });
};

// Public comments list
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
    res.send({ status: 200, data: results || [] });
  });
};

// Create comment
exports.createComment = (req, res) => {
  const userId = req.auth.id;
  const postId = parseInt(req.params.id, 10);
  const { content, reply_to_id } = req.body || {};
  const trimContent = String(content || "").trim();
  if (!postId || !trimContent) return res.cc("参数错误", 400);

  const sql = "INSERT INTO discover_post_comment (post_id, user_id, reply_to_id, content, create_time) VALUES (?, ?, ?, ?, NOW())";
  const replyId = reply_to_id ? parseInt(reply_to_id, 10) : null;
  db.query(sql, [postId, userId, replyId, trimContent], (err, result) => {
    if (err) return res.cc(err);
    db.query("UPDATE discover_post SET comment_count = comment_count + 1 WHERE id=?", [postId], () => {});
    res.send({ status: 200, message: "评论成功", data: { id: result.insertId } });
  });
};

// Delete current user's post
exports.deleteMyPost = (req, res) => {
  const userId = req.auth.id;
  const { id } = req.body || {};
  const postId = parseInt(id, 10);
  if (!postId) return res.cc("参数不完整", 400);

  db.query("DELETE FROM discover_post_like WHERE post_id=?", [postId], (err) => {
    if (err) return res.cc(err);
    db.query("DELETE FROM discover_post_comment WHERE post_id=?", [postId], (err2) => {
      if (err2) return res.cc(err2);

      db.query("DELETE FROM discover_post WHERE id=? AND user_id=?", [postId, userId], (err3, result) => {
        if (err3) return res.cc(err3);
        if (!result || result.affectedRows === 0) return res.cc("帖子不存在或无权限", 404);
        res.send({ status: 200, message: "删除成功" });
      });
    });
  });
};
