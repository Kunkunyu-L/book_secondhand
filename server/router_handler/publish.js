const db = require("../db/config");

// 发布图书
exports.publishBook = (req, res) => {
  const userId = req.auth.id;
  const { isbn, title, author, publisher, publish_date, category, tags, cover_img, detail_imgs, book_story, condition, condition_desc, original_price, price } = req.body;

  if (!title || !author || !price) return res.cc("请填写必要信息（书名、作者、价格）", 400);

  const bookData = {
    user_id: userId,
    isbn: isbn || "",
    title,
    author,
    publisher: publisher || "",
    publish_date: publish_date || "",
    category: category || null,
    tags: tags || "",
    status: "onsale",
    cover_img: cover_img || "",
    detail_imgs: detail_imgs || "",
    book_story: book_story || "",
    nope: 0,
  };

  const sql = "INSERT INTO user_book SET ?";
  db.query(sql, bookData, (err, results) => {
    if (err) return res.cc(err);
    const bookId = results.insertId;

    // 插入价格信息
    const priceSql = "INSERT INTO book_condition_price SET ?";
    db.query(priceSql, {
      type: "user",
      book_id: bookId,
      condition: condition || 8,
      condition_desc: condition_desc || "",
      original_price: original_price || price,
      price: price,
      stock: 1,
    }, (err2) => {
      if (err2) return res.cc(err2);
      res.send({ status: 200, message: "发布成功", data: { book_id: bookId } });
    });
  });
};

// 获取我发布的图书
exports.getMyBooks = (req, res) => {
  const userId = req.auth.id;
  const sql = `
    SELECT ub.*, bcp.price, bcp.original_price, bcp.\`condition\`, bcp.condition_desc, bcp.stock
    FROM user_book ub
    LEFT JOIN book_condition_price bcp ON ub.id = bcp.book_id AND bcp.type='user'
    WHERE ub.user_id = ?
    ORDER BY ub.create_datetime DESC
  `;
  db.query(sql, [userId], (err, results) => {
    if (err) return res.cc(err);
    res.send({ status: 200, message: "获取成功", data: results });
  });
};

// 更新图书状态
exports.updateBookStatus = (req, res) => {
  const userId = req.auth.id;
  const { book_id, status } = req.body;
  if (!book_id || !["onsale", "offline"].includes(status)) return res.cc("参数错误", 400);

  db.query("UPDATE user_book SET status=? WHERE id=? AND user_id=?", [status, book_id, userId], (err, results) => {
    if (err) return res.cc(err);
    if (results.affectedRows === 0) return res.cc("图书不存在", 404);
    res.send({ status: 200, message: "更新成功" });
  });
};

// 删除图书
exports.deleteBook = (req, res) => {
  const userId = req.auth.id;
  const { book_id } = req.body;
  if (!book_id) return res.cc("参数不完整", 400);

  // 先删价格，再删图书
  db.query("DELETE FROM book_condition_price WHERE book_id=? AND type='user'", [book_id], () => {
    db.query("DELETE FROM user_book WHERE id=? AND user_id=?", [book_id, userId], (err) => {
      if (err) return res.cc(err);
      res.send({ status: 200, message: "删除成功" });
    });
  });
};
