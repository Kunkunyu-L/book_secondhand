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

// 获取单本图书详情（用于编辑，支持 user/platform，仅本人）
exports.getBookDetail = (req, res) => {
  const userId = req.auth.id;
  const bookId = req.query.book_id;
  const bookType = (req.query.type || "user") === "platform" ? "platform" : "user";
  if (!bookId) return res.cc("缺少 book_id", 400);

  if (bookType === "platform") {
    const sql = `SELECT pb.*, pb.description AS book_story, bcp.price, bcp.original_price, bcp.\`condition\`, bcp.condition_desc
      FROM platform_book pb
      LEFT JOIN book_condition_price bcp ON pb.id = bcp.book_id AND bcp.type COLLATE utf8mb4_unicode_ci = 'platform'
      WHERE pb.id = ? AND pb.user_id = ?`;
    db.query(sql, [bookId, userId], (err, results) => {
      if (err) return res.cc(err);
      if (!results || results.length === 0) return res.cc("图书不存在", 404);
      res.send({ status: 200, message: "获取成功", data: results[0] });
    });
    return;
  }

  const sql = `SELECT ub.*, bcp.price, bcp.original_price, bcp.\`condition\`, bcp.condition_desc
    FROM user_book ub
    LEFT JOIN book_condition_price bcp ON ub.id = bcp.book_id AND bcp.type COLLATE utf8mb4_unicode_ci = 'user'
    WHERE ub.id = ? AND ub.user_id = ?`;
  db.query(sql, [bookId, userId], (err, results) => {
    if (err) return res.cc(err);
    if (!results || results.length === 0) return res.cc("图书不存在", 404);
    res.send({ status: 200, message: "获取成功", data: results[0] });
  });
};

// 更新图书（编辑，支持 user/platform，仅本人）
exports.updateBook = (req, res) => {
  const userId = req.auth.id;
  const { book_id, book_type, isbn, title, author, publisher, publish_date, category, tags, cover_img, detail_imgs, book_story, description, condition, condition_desc, original_price, price } = req.body;
  const type = (book_type || "user") === "platform" ? "platform" : "user";

  if (!book_id || !title || !author || !price) return res.cc("请填写必要信息（书名、作者、价格）", 400);

  if (type === "platform") {
    const bookData = {
      isbn: isbn || "",
      title,
      author,
      publisher: publisher || "",
      publish_date: publish_date || "",
      category: category || null,
      tags: tags || "",
      cover_img: cover_img || "",
      detail_imgs: detail_imgs || "",
      description: description || book_story || "",
      update_datetime: new Date(),
    };
    db.query("UPDATE platform_book SET ? WHERE id = ? AND user_id = ?", [bookData, book_id, userId], (err, results) => {
      if (err) return res.cc(err);
      if (results.affectedRows === 0) return res.cc("图书不存在", 404);
      const priceData = { condition: condition || 8, condition_desc: condition_desc || "", original_price: original_price || price, price: price, stock: 1 };
      db.query("UPDATE book_condition_price SET ? WHERE book_id = ? AND type = 'platform'", [priceData, book_id], (err2) => {
        if (err2) return res.cc(err2);
        res.send({ status: 200, message: "更新成功", data: { book_id } });
      });
    });
    return;
  }

  const bookData = {
    isbn: isbn || "",
    title,
    author,
    publisher: publisher || "",
    publish_date: publish_date || "",
    category: category || null,
    tags: tags || "",
    cover_img: cover_img || "",
    detail_imgs: detail_imgs || "",
    book_story: book_story || "",
    update_datetime: new Date(),
  };
  db.query("UPDATE user_book SET ? WHERE id = ? AND user_id = ?", [bookData, book_id, userId], (err, results) => {
    if (err) return res.cc(err);
    if (results.affectedRows === 0) return res.cc("图书不存在", 404);
    const priceData = { condition: condition || 8, condition_desc: condition_desc || "", original_price: original_price || price, price: price, stock: 1 };
    db.query("UPDATE book_condition_price SET ? WHERE book_id = ? AND type = 'user'", [priceData, book_id], (err2) => {
      if (err2) return res.cc(err2);
      res.send({ status: 200, message: "更新成功", data: { book_id } });
    });
  });
};

// 获取我发布的图书（含 user_book 和 platform_book，与「我发布的」数量一致）
exports.getMyBooks = (req, res) => {
  const userId = req.auth.id;
  const sql = `
    (SELECT ub.id, ub.user_id, ub.isbn, ub.title, ub.author, ub.publisher, ub.publish_date,
            ub.category, ub.tags, ub.status, ub.cover_img, ub.detail_imgs, ub.book_story,
            ub.nope, ub.create_datetime, ub.update_datetime,
            bcp.price, bcp.original_price, bcp.\`condition\`, bcp.condition_desc, bcp.stock,
            'user' AS book_type
     FROM user_book ub
     LEFT JOIN book_condition_price bcp ON ub.id = bcp.book_id AND bcp.type COLLATE utf8mb4_unicode_ci = 'user'
     WHERE ub.user_id = ?)
    UNION ALL
    (SELECT pb.id, pb.user_id, pb.isbn, pb.title, pb.author, pb.publisher, pb.publish_date,
            pb.category, pb.tags, pb.status, pb.cover_img, pb.detail_imgs, pb.description AS book_story,
            NULL AS nope, pb.create_datetime, pb.update_datetime,
            bcp.price, bcp.original_price, bcp.\`condition\`, bcp.condition_desc, bcp.stock,
            'platform' AS book_type
     FROM platform_book pb
     LEFT JOIN book_condition_price bcp ON pb.id = bcp.book_id AND bcp.type COLLATE utf8mb4_unicode_ci = 'platform'
     WHERE pb.user_id = ?)
    ORDER BY create_datetime DESC
  `;
  db.query(sql, [userId, userId], (err, results) => {
    if (err) return res.cc(err);
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.send({ status: 200, message: "获取成功", data: results });
  });
};

// 更新图书状态（上架/下架，支持 user/platform，仅本人）
exports.updateBookStatus = (req, res) => {
  const userId = req.auth.id;
  const { book_id, book_type, status } = req.body;
  if (!book_id || !["onsale", "offline"].includes(status)) return res.cc("参数错误", 400);
  const type = (book_type || "user") === "platform" ? "platform" : "user";

  const table = type === "platform" ? "platform_book" : "user_book";
  db.query(`UPDATE ${table} SET status=? WHERE id=? AND user_id=?`, [status, book_id, userId], (err, results) => {
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
