const db = require("../db/config");

// 获取购物车列表（含图书详情和价格）
exports.getCartList = (req, res) => {
  const userId = req.auth.id;
  const sql = `
    SELECT 
      c.id AS cart_id, c.book_id, c.book_type, c.quantity, c.selected,
      CASE 
        WHEN c.book_type = 'platform' THEN pb.title
        WHEN c.book_type = 'user' THEN ub.title
      END AS title,
      CASE 
        WHEN c.book_type = 'platform' THEN pb.cover_img
        WHEN c.book_type = 'user' THEN ub.cover_img
      END AS cover_img,
      CASE 
        WHEN c.book_type = 'platform' THEN pb.author
        WHEN c.book_type = 'user' THEN ub.author
      END AS author,
      CASE 
        WHEN c.book_type = 'platform' THEN pb.status
        WHEN c.book_type = 'user' THEN ub.status
      END AS book_status,
      bcp.price, bcp.original_price, bcp.stock, bcp.\`condition\`
    FROM cart c
    LEFT JOIN platform_book pb ON c.book_id = pb.id AND c.book_type COLLATE utf8mb4_unicode_ci = 'platform'
    LEFT JOIN user_book ub ON c.book_id = ub.id AND c.book_type COLLATE utf8mb4_unicode_ci = 'user'
    LEFT JOIN book_condition_price bcp ON c.book_id = bcp.book_id AND c.book_type COLLATE utf8mb4_unicode_ci = bcp.type COLLATE utf8mb4_unicode_ci
    WHERE c.user_id = ?
    ORDER BY c.created_at DESC
  `;
  db.query(sql, [userId], (err, results) => {
    if (err) return res.cc(err);
    res.send({ status: 200, message: "获取购物车成功", data: results });
  });
};

// 添加到购物车
exports.addToCart = (req, res) => {
  const userId = req.auth.id;
  const { book_id, book_type, quantity = 1 } = req.body;
  if (!book_id || !book_type) return res.cc("参数不完整", 400);

  // 检查是否已在购物车，已存在则增加数量
  const checkSql = "SELECT * FROM cart WHERE user_id=? AND book_id=? AND book_type COLLATE utf8mb4_unicode_ci = ?";
  db.query(checkSql, [userId, book_id, book_type], (err, results) => {
    if (err) return res.cc(err);
    if (results.length > 0) {
      const updateSql = "UPDATE cart SET quantity=quantity+? WHERE id=?";
      db.query(updateSql, [quantity, results[0].id], (err2) => {
        if (err2) return res.cc(err2);
        res.send({ status: 200, message: "已更新购物车数量" });
      });
    } else {
      const insertSql = "INSERT INTO cart SET ?";
      db.query(insertSql, { user_id: userId, book_id, book_type, quantity }, (err2) => {
        if (err2) return res.cc(err2);
        res.send({ status: 200, message: "已加入购物车" });
      });
    }
  });
};

// 更新购物车数量
exports.updateCartItem = (req, res) => {
  const userId = req.auth.id;
  const { cart_id, quantity } = req.body;
  if (!cart_id || !quantity) return res.cc("参数不完整", 400);
  const sql = "UPDATE cart SET quantity=? WHERE id=? AND user_id=?";
  db.query(sql, [quantity, cart_id, userId], (err, results) => {
    if (err) return res.cc(err);
    res.send({ status: 200, message: "更新成功" });
  });
};

// 删除购物车项（支持批量）
exports.removeCartItem = (req, res) => {
  const userId = req.auth.id;
  const { cart_ids } = req.body;
  if (!cart_ids || !cart_ids.length) return res.cc("参数不完整", 400);
  const sql = "DELETE FROM cart WHERE id IN (?) AND user_id=?";
  db.query(sql, [cart_ids, userId], (err) => {
    if (err) return res.cc(err);
    res.send({ status: 200, message: "删除成功" });
  });
};

// 更新选中状态
exports.updateSelected = (req, res) => {
  const userId = req.auth.id;
  const { cart_id, selected } = req.body;
  const sql = "UPDATE cart SET selected=? WHERE id=? AND user_id=?";
  db.query(sql, [selected, cart_id, userId], (err) => {
    if (err) return res.cc(err);
    res.send({ status: 200, message: "更新成功" });
  });
};

// 全选/取消全选
exports.selectAll = (req, res) => {
  const userId = req.auth.id;
  const { selected } = req.body;
  const sql = "UPDATE cart SET selected=? WHERE user_id=?";
  db.query(sql, [selected, userId], (err) => {
    if (err) return res.cc(err);
    res.send({ status: 200, message: "更新成功" });
  });
};
