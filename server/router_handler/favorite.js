const db = require("../db/config");

// 获取收藏列表
exports.getFavoriteList = (req, res) => {
  const userId = req.auth.id;
  const sql = `
    SELECT f.id AS fav_id, f.book_id, f.book_type, f.created_at,
      CASE 
        WHEN f.book_type='platform' THEN pb.title
        WHEN f.book_type='user' THEN ub.title
      END AS title,
      CASE 
        WHEN f.book_type='platform' THEN pb.cover_img
        WHEN f.book_type='user' THEN ub.cover_img
      END AS cover_img,
      CASE 
        WHEN f.book_type='platform' THEN pb.author
        WHEN f.book_type='user' THEN ub.author
      END AS author,
      CASE 
        WHEN f.book_type='platform' THEN pb.status
        WHEN f.book_type='user' THEN ub.status
      END AS book_status,
      bcp.price, bcp.original_price
    FROM favorite f
    LEFT JOIN platform_book pb ON f.book_id = pb.id AND f.book_type COLLATE utf8mb4_unicode_ci = 'platform'
    LEFT JOIN user_book ub ON f.book_id = ub.id AND f.book_type COLLATE utf8mb4_unicode_ci = 'user'
    LEFT JOIN book_condition_price bcp ON f.book_id = bcp.book_id AND f.book_type COLLATE utf8mb4_unicode_ci = bcp.type COLLATE utf8mb4_unicode_ci
    WHERE f.user_id = ?
    ORDER BY f.created_at DESC
  `;
  db.query(sql, [userId], (err, results) => {
    if (err) return res.cc(err);
    res.send({ status: 200, message: "获取收藏列表成功", data: results });
  });
};

// 添加收藏
exports.addFavorite = (req, res) => {
  const userId = req.auth.id;
  const { book_id, book_type } = req.body;
  if (!book_id || !book_type) return res.cc("参数不完整", 400);

  const sql = "INSERT IGNORE INTO favorite SET ?";
  db.query(sql, { user_id: userId, book_id, book_type }, (err, results) => {
    if (err) return res.cc(err);
    res.send({ status: 200, message: results.affectedRows ? "收藏成功" : "已收藏" });
  });
};

// 取消收藏
exports.removeFavorite = (req, res) => {
  const userId = req.auth.id;
  const { book_id, book_type } = req.body;
  if (!book_id || !book_type) return res.cc("参数不完整", 400);
  db.query("DELETE FROM favorite WHERE user_id=? AND book_id=? AND book_type COLLATE utf8mb4_unicode_ci = ?", [userId, book_id, book_type], (err) => {
    if (err) return res.cc(err);
    res.send({ status: 200, message: "取消收藏成功" });
  });
};

// 检查是否已收藏
exports.checkFavorite = (req, res) => {
  const userId = req.auth.id;
  const { book_id, book_type } = req.query;
  if (!book_id || !book_type) return res.cc("参数不完整", 400);
  db.query("SELECT id FROM favorite WHERE user_id=? AND book_id=? AND book_type COLLATE utf8mb4_unicode_ci = ?", [userId, book_id, book_type], (err, results) => {
    if (err) return res.cc(err);
    res.send({ status: 200, message: "查询成功", data: { isFavorited: results.length > 0 } });
  });
};
