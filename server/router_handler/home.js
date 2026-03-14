const db = require("../db/config");

const query = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.query(sql, params, (err, r) => (err ? reject(err) : resolve(r)));
  });

// 获取系统配置（公开，供 uniapp 前台使用，与后台基础设置一致）
exports.getSystemConfig = async (req, res) => {
  try {
    const list = await query("SELECT config_key, config_value FROM system_config ORDER BY id ASC");
    const configs = {};
    list.forEach((c) => {
      configs[c.config_key] = c.config_value;
    });
    res.send({ status: 200, message: "获取成功", data: configs });
  } catch (err) {
    res.cc(err);
  }
};

//查询一级分类
exports.getLevel1Categories = (req, res) => {
  const sql = "select * from book_category";
  db.query(sql, (err, results) => {
    if (err) return res.cc(err);
    res.send({
      status: 200,
      message: "获取一级分类成功！",
      data: results,
    });
  });
};

//查询平台售卖的图书
exports.getBookPlatformInfo = (req, res) => {
  const sql = `
   SELECT 
        platform_book.*,
        book_condition_price.*,
        book_category.name AS category_name
      FROM 
        platform_book
      LEFT JOIN book_condition_price 
        ON platform_book.id = book_condition_price.book_id 
        AND book_condition_price.type COLLATE utf8mb4_unicode_ci = 'platform'
      LEFT JOIN book_category 
        ON platform_book.category = book_category.id
  `;
  db.query(sql, (err, results) => {
    if (err) return res.cc(err);
    res.send({
      status: 200,
      message: "获取平台售卖图书成功！",
      data: results,
    });
  });
};

//查询用户售卖的信息
exports.getBookUserInfo = (req, res) => {
  // const sql = "SELECT * FROM user_book";
  const sql = `
    SELECT 
      user_book.*,
      book_condition_price.*,
      book_category.name AS category_name,
      user.nickname,  
      user.avatar    
    FROM 
      user_book
    LEFT JOIN book_condition_price 
      ON user_book.id = book_condition_price.book_id 
      AND book_condition_price.type COLLATE utf8mb4_unicode_ci = 'user'
    LEFT JOIN book_category 
      ON user_book.category = book_category.id
    LEFT JOIN user 
      ON user_book.user_id = user.id 
  `;
  db.query(sql, (err, results) => {
    if (err) return res.cc(err);
    res.send({
      status: 200,
      message: "获取用户售卖图书成功！",
      data: results,
    });
  });
};

exports.getBookMarketInfo = (req, res) => {
  // 多表联查 SQL + 随机排序
  const sql = `
    (
      SELECT 
        ub.id,
        ub.user_id,
        ub.isbn,
        ub.title,
        ub.author,
        ub.publisher,
        ub.publish_date,
        ub.category,
        ub.tags,
        ub.status,
        ub.cover_img,
        ub.detail_imgs,
        ub.book_story,
        ub.nope,
        ub.create_datetime,
        ub.update_datetime,
        NULL AS description,
        NULL AS sales_count,
        bcp.id AS bcp_id,
        bcp.type AS bcp_type,
        bcp.book_id AS bcp_book_id,
        bcp.condition AS bcp_condition,
        bcp.condition_desc AS bcp_condition_desc,
        bcp.original_price AS bcp_original_price,
        bcp.price AS bcp_price,
        bcp.stock AS bcp_stock,
        u.nickname,
        u.avatar,
        'user' AS source
      FROM user_book ub
      LEFT JOIN book_condition_price bcp 
        ON ub.id = bcp.book_id AND bcp.type COLLATE utf8mb4_unicode_ci = 'user'
      LEFT JOIN \`user\` u 
        ON ub.user_id = u.id
      WHERE ub.status = 'onsale'
    )
    UNION ALL
    (
      SELECT 
        pb.id,
        pb.user_id,
        pb.isbn,
        pb.title,
        pb.author,
        pb.publisher,
        pb.publish_date,
        pb.category,
        pb.tags,
        pb.status,
        pb.cover_img,
        pb.detail_imgs,
        NULL AS book_story, 
        NULL AS nope,
        pb.create_datetime,
        pb.update_datetime,
        pb.description,
        pb.sales_count,
        bcp.id AS bcp_id,
        bcp.type AS bcp_type,
        bcp.book_id AS bcp_book_id,
        bcp.condition AS bcp_condition,
        bcp.condition_desc AS bcp_condition_desc,
        bcp.original_price AS bcp_original_price,
        bcp.price AS bcp_price,
        bcp.stock AS bcp_stock,
        NULL AS nickname,
        NULL AS avatar,
        'platform' AS source
      FROM platform_book pb
      LEFT JOIN book_condition_price bcp 
        ON pb.id = bcp.book_id AND bcp.type COLLATE utf8mb4_unicode_ci = 'platform'
      WHERE pb.status = 'onsale'
    )
    ORDER BY RAND();
  `;
  db.query(sql, (err, results) => {
    if (err) return res.cc(err);
    res.send({
      status: 200,
      message: "获取书市内容成功！",
      data: results,
    });
  });
};

exports.getBookDetailInfo = (req, res) => {
  const { bookId, bookType } = req.body;
  if (!bookId || !bookType) {
    return res.send({ code: 400, message: "缺少参数（bookId 或 bookType）" });
  }
  let joinTable; // 要关联的表名
  if (bookType === "user") {
    joinTable = "user_book"; // 用户售卖：关联 user_book 表
  } else if (bookType === "platform") {
    joinTable = "platform_book"; // 平台售卖：关联 platform_book 表
  } else {
    return res.send({ code: 400, message: "bookType 必须是 user 或 platform" });
  }

  console.log(joinTable);
  const sql = `
      SELECT 
        pb.*,
        bcp.*,
        u.nickname,
        u.avatar,
        u.credit_score
      FROM 
        ${joinTable} pb
      LEFT JOIN 
        book_condition_price bcp 
        ON pb.id = bcp.book_id 
        AND bcp.type COLLATE utf8mb4_unicode_ci = ? 
      LEFT JOIN 
        user u 
        ON pb.user_id = u.id 
      WHERE 
        pb.id = ?; 
    `;
  db.query(sql, [bookType, bookId], (err, results) => {
    if (err) return res.send({ code: 500, message: "服务器错误" });
    res.send({
      status: 200,
      message: "获取图书详情成功",
      data: results,
    });
  });
};

// ==================== 公开内容接口 ====================

// 获取轮播图（启用的，按sort排序）
exports.getBanners = (req, res) => {
  const sql = "SELECT id, image_url, link_url, title, sort FROM banner WHERE status=1 ORDER BY sort ASC, id DESC";
  db.query(sql, (err, results) => {
    if (err) return res.cc(err);
    res.send({ status: 200, message: "获取轮播图成功", data: results });
  });
};

// 获取公告列表（已发布的）
exports.getAnnouncements = (req, res) => {
  const { type } = req.query; // notice/activity/system
  let sql = "SELECT id, title, content, type, created_at FROM announcement WHERE status='published'";
  const params = [];
  if (type) {
    sql += " AND type=?";
    params.push(type);
  }
  sql += " ORDER BY created_at DESC LIMIT 20";
  db.query(sql, params, (err, results) => {
    if (err) return res.cc(err);
    res.send({ status: 200, message: "获取公告成功", data: results });
  });
};

// 获取公告详情
exports.getAnnouncementDetail = (req, res) => {
  const { id } = req.query;
  if (!id) return res.cc("缺少参数", 400);
  db.query("SELECT * FROM announcement WHERE id=? AND status='published'", [id], (err, results) => {
    if (err) return res.cc(err);
    if (results.length === 0) return res.cc("公告不存在", 404);
    res.send({ status: 200, message: "获取公告详情成功", data: results[0] });
  });
};

// 获取帮助文章列表
exports.getHelpArticles = (req, res) => {
  const { category } = req.query;
  let sql = "SELECT id, title, category, sort, created_at FROM help_article WHERE status=1";
  const params = [];
  if (category) {
    sql += " AND category=?";
    params.push(category);
  }
  sql += " ORDER BY sort ASC, created_at DESC";
  db.query(sql, params, (err, results) => {
    if (err) return res.cc(err);
    res.send({ status: 200, message: "获取帮助文章成功", data: results });
  });
};

// 获取帮助文章详情
exports.getHelpArticleDetail = (req, res) => {
  const { id } = req.query;
  if (!id) return res.cc("缺少参数", 400);
  db.query("SELECT * FROM help_article WHERE id=? AND status=1", [id], (err, results) => {
    if (err) return res.cc(err);
    if (results.length === 0) return res.cc("文章不存在", 404);
    res.send({ status: 200, message: "获取文章详情成功", data: results[0] });
  });
};

// 获取FAQ列表
exports.getFaqs = (req, res) => {
  const { category_id, keyword } = req.query;
  let sql = "SELECT f.id, f.question, f.answer, f.category AS category_name FROM faq f WHERE 1=1";
  const params = [];
  if (category_id) {
    sql += " AND f.category=?";
    params.push(category_id);
  }
  if (keyword) {
    sql += " AND (f.question LIKE ? OR f.answer LIKE ?)";
    params.push(`%${keyword}%`, `%${keyword}%`);
  }
  sql += " ORDER BY f.sort ASC, f.id DESC";
  db.query(sql, params, (err, results) => {
    if (err) return res.cc(err);
    res.send({ status: 200, message: "获取FAQ成功", data: results });
  });
};

// 获取可领取优惠券列表（公开）
exports.getAvailableCoupons = (req, res) => {
  const sql = `SELECT id, name, type, discount_value, min_amount, start_time, end_time, total_count, used_count 
    FROM coupon WHERE status=1 AND end_time > NOW() AND (total_count=0 OR used_count < total_count) 
    ORDER BY created_at DESC`;
  db.query(sql, (err, results) => {
    if (err) return res.cc(err);
    res.send({ status: 200, message: "获取优惠券成功", data: results });
  });
};

// 搜索图书
exports.searchBooks = (req, res) => {
  const { keyword, category } = req.query;
  let conditions = ["b.status = 'onsale'"];
  let params = [];

  if (keyword) {
    conditions.push("(b.title LIKE ? OR b.author LIKE ? OR b.isbn LIKE ?)");
    const kw = `%${keyword}%`;
    params.push(kw, kw, kw);
  }
  if (category) {
    conditions.push("b.category = ?");
    params.push(category);
  }

  const where = conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";
  const allParams = [...params, ...params]; // 两个子查询各用一次

  const sql = `
    (
      SELECT b.id, b.title, b.author, b.cover_img, b.category, b.tags, b.status,
        bcp.price, bcp.original_price, bcp.\`condition\`, bcp.stock,
        NULL AS nickname, NULL AS avatar, 'platform' AS source
      FROM platform_book b
      LEFT JOIN book_condition_price bcp ON b.id = bcp.book_id AND bcp.type COLLATE utf8mb4_unicode_ci = 'platform'
      ${where}
    )
    UNION ALL
    (
      SELECT b.id, b.title, b.author, b.cover_img, b.category, b.tags, b.status,
        bcp.price, bcp.original_price, bcp.\`condition\`, bcp.stock,
        u.nickname, u.avatar, 'user' AS source
      FROM user_book b
      LEFT JOIN book_condition_price bcp ON b.id = bcp.book_id AND bcp.type COLLATE utf8mb4_unicode_ci = 'user'
      LEFT JOIN \`user\` u ON b.user_id = u.id
      ${where}
    )
    ORDER BY price ASC
  `;

  db.query(sql, allParams, (err, results) => {
    if (err) return res.cc(err);
    res.send({ status: 200, message: "搜索成功", data: results });
  });
};
