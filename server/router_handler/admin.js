const db = require("../db/config");
const bcrypt = require("bcryptjs");

// Promise 包装 db.query
const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

// ===================== 仪表盘 =====================

exports.getDashboard = async (req, res) => {
  try {
    const userCount = await query("SELECT COUNT(*) as count FROM user");
    const platformBookCount = await query("SELECT COUNT(*) as count FROM platform_book");
    const userBookCount = await query("SELECT COUNT(*) as count FROM user_book");
    const orderCount = await query("SELECT COUNT(*) as count FROM orders");
    const revenue = await query(
      "SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status IN ('paid', 'shipped', 'completed')"
    );
    const todayOrders = await query(
      "SELECT COUNT(*) as count FROM orders WHERE DATE(created_at) = CURDATE()"
    );
    const pendingOrders = await query(
      "SELECT COUNT(*) as count FROM orders WHERE status = 'pending'"
    );
    const reviewingBooks = await query(
      "SELECT COUNT(*) as count FROM user_book WHERE status = 'reviewing'"
    );
    const recentOrders = await query(`
      SELECT o.id, o.order_no, o.total_amount, o.status, o.created_at,
        u.username, u.nickname
      FROM orders o
      LEFT JOIN user u ON o.user_id = u.id
      ORDER BY o.created_at DESC LIMIT 10
    `);

    res.send({
      status: 200,
      message: "获取统计数据成功",
      data: {
        userCount: userCount[0].count,
        platformBookCount: platformBookCount[0].count,
        userBookCount: userBookCount[0].count,
        orderCount: orderCount[0].count,
        revenue: revenue[0].total,
        todayOrderCount: todayOrders[0].count,
        pendingOrderCount: pendingOrders[0].count,
        reviewingBookCount: reviewingBooks[0].count,
        recentOrders,
      },
    });
  } catch (err) {
    res.cc(err);
  }
};

// ===================== 用户管理 =====================

exports.getUsers = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 10));
    const offset = (page - 1) * pageSize;
    const keyword = req.query.keyword || "";
    const status = req.query.status;
    const role = req.query.role;

    let where = "WHERE 1=1";
    const params = [];

    if (keyword) {
      where += " AND (username LIKE ? OR nickname LIKE ? OR phone LIKE ?)";
      const kw = `%${keyword}%`;
      params.push(kw, kw, kw);
    }
    if (status !== undefined && status !== "" && status !== "all") {
      where += " AND status = ?";
      params.push(Number(status));
    }
    if (role && role !== "all") {
      where += " AND role = ?";
      params.push(role);
    }

    const countResult = await query(`SELECT COUNT(*) as total FROM user ${where}`, params);
    const users = await query(
      `SELECT id, username, phone, role, avatar, nickname, credit_score, status, account, school, major, created_at, updated_at
       FROM user ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    res.send({
      status: 200,
      message: "获取用户列表成功",
      data: { list: users, total: countResult[0].total, page, pageSize },
    });
  } catch (err) {
    res.cc(err);
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { id, status } = req.body;
    if (!id || status === undefined) return res.cc("参数不完整", 400);
    await query("UPDATE user SET status = ? WHERE id = ?", [status, id]);
    res.send({ status: 200, message: "更新用户状态成功" });
  } catch (err) {
    res.cc(err);
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { id, role } = req.body;
    if (!id || !role) return res.cc("参数不完整", 400);
    if (!["superAdmin", "operationAdmin", "customerService", "user"].includes(role)) return res.cc("角色类型无效", 400);
    await query("UPDATE user SET role = ? WHERE id = ?", [role, id]);
    res.send({ status: 200, message: "更新用户角色成功" });
  } catch (err) {
    res.cc(err);
  }
};

exports.addUser = async (req, res) => {
  try {
    const { username, password, phone, nickname, role } = req.body;

    if (!username || !password) return res.cc("用户名和密码不能为空", 400);

    // 检查用户名是否已存在
    const existingUser = await query("SELECT id FROM user WHERE username = ?", [username]);
    if (existingUser.length > 0) return res.cc("用户名已存在", 400);

    // 设置默认值
    const userRole = role || "user";
    const userNickname = nickname || "";
    const userPhone = phone || "";
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // 加密密码
    const hashedPassword = bcrypt.hashSync(password, 10);

    // 插入新用户
    const result = await query("INSERT INTO user (username, password, phone, nickname, role, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)", [
      username,
      hashedPassword,
      userPhone,
      userNickname,
      userRole,
      1, // 默认状态为正常
      now
    ]);

    res.send({
      status: 200,
      message: "添加用户成功",
      data: { id: result.insertId }
    });
  } catch (err) {
    res.cc(err);
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id, nickname, phone, school, major, avatar, account } = req.body;
    if (!id) return res.cc("参数不完整", 400);
    const fields = [];
    const params = [];
    if (nickname !== undefined) { fields.push("nickname=?"); params.push(nickname); }
    if (phone !== undefined) { fields.push("phone=?"); params.push(phone); }
    if (school !== undefined) { fields.push("school=?"); params.push(school); }
    if (major !== undefined) { fields.push("major=?"); params.push(major); }
    if (avatar !== undefined) { fields.push("avatar=?"); params.push(avatar); }
    if (account !== undefined) {
      const n = Number(account);
      if (Number.isNaN(n) || !Number.isFinite(n)) return res.cc("余额格式不正确", 400);
      fields.push("account=?");
      params.push(Math.trunc(n));
    }
    if (fields.length === 0) return res.cc("无可更新字段", 400);
    params.push(id);
    await query(`UPDATE user SET ${fields.join(", ")} WHERE id=?`, params);
    res.send({ status: 200, message: "更新成功" });
  } catch (err) { res.cc(err); }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.cc("参数不完整", 400);
    const self = await query("SELECT id FROM user WHERE id=? AND role='superAdmin'", [id]);
    if (self.length > 0) return res.cc("不能删除超级管理员", 403);
    await query("DELETE FROM user WHERE id=?", [id]);
    res.send({ status: 200, message: "删除成功" });
  } catch (err) { res.cc(err); }
};

// ===================== 用户违规处理 =====================

exports.getViolationList = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 10));
    const offset = (page - 1) * pageSize;
    const userId = req.query.user_id || "";
    const keyword = req.query.keyword || "";

    let where = "WHERE 1=1";
    const params = [];

    if (userId) {
      where += " AND v.user_id = ?";
      params.push(userId);
    }
    if (keyword) {
      where += " AND (u.username LIKE ? OR u.nickname LIKE ?)";
      const kw = `%${keyword}%`;
      params.push(kw, kw);
    }

    const countResult = await query(
      `SELECT COUNT(*) as total FROM user_violation v LEFT JOIN user u ON v.user_id = u.id ${where}`, params
    );
    const records = await query(
      `SELECT v.*, u.username, u.nickname, u.avatar, u.status as user_status, u.credit_score,
        a.username as admin_name
      FROM user_violation v
      LEFT JOIN user u ON v.user_id = u.id
      LEFT JOIN user a ON v.admin_id = a.id
      ${where}
      ORDER BY v.created_at DESC LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    res.send({
      status: 200,
      message: "获取违规记录成功",
      data: { list: records, total: countResult[0].total, page, pageSize },
    });
  } catch (err) {
    res.cc(err);
  }
};

exports.addViolation = async (req, res) => {
  try {
    const adminId = req.auth.id;
    const { user_id, type, reason } = req.body;
    if (!user_id || !type || !reason) return res.cc("参数不完整", 400);
    if (!["warning", "freeze", "unfreeze"].includes(type)) return res.cc("处理类型无效", 400);

    await query("INSERT INTO user_violation SET ?", {
      user_id, type, reason, admin_id: adminId,
    });

    // 冻结/解封：更新用户状态
    if (type === "freeze") {
      await query("UPDATE user SET status = 0 WHERE id = ?", [user_id]);
    } else if (type === "unfreeze") {
      await query("UPDATE user SET status = 1 WHERE id = ?", [user_id]);
    }

    res.send({ status: 200, message: "处理成功" });
  } catch (err) {
    res.cc(err);
  }
};

// ===================== 分类管理 =====================

exports.getCategories = async (req, res) => {
  try {
    const categories = await query("SELECT * FROM book_category ORDER BY sort DESC, id ASC");
    res.send({ status: 200, message: "获取分类列表成功", data: categories });
  } catch (err) {
    res.cc(err);
  }
};

exports.addCategory = async (req, res) => {
  try {
    const { name, img, sort, status } = req.body;
    if (!name) return res.cc("分类名称不能为空", 400);
    await query("INSERT INTO book_category SET ?", {
      name, img: img || "", sort: sort || 0, status: status !== undefined ? status : 1,
    });
    res.send({ status: 200, message: "添加分类成功" });
  } catch (err) {
    res.cc(err);
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id, name, img, sort, status } = req.body;
    if (!id) return res.cc("参数不完整", 400);
    await query("UPDATE book_category SET name=?, img=?, sort=?, status=? WHERE id=?",
      [name, img || "", sort || 0, status, id]);
    res.send({ status: 200, message: "更新分类成功" });
  } catch (err) {
    res.cc(err);
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.cc("参数不完整", 400);
    await query("DELETE FROM book_category WHERE id=?", [id]);
    res.send({ status: 200, message: "删除分类成功" });
  } catch (err) {
    res.cc(err);
  }
};

// ===================== 平台图书管理 =====================

exports.getPlatformBooks = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 10));
    const offset = (page - 1) * pageSize;
    const keyword = req.query.keyword || "";
    const category = req.query.category || "";
    const bookStatus = req.query.status || "";

    let where = "WHERE 1=1";
    const params = [];

    if (keyword) {
      where += " AND (pb.title LIKE ? OR pb.author LIKE ? OR pb.isbn LIKE ?)";
      const kw = `%${keyword}%`;
      params.push(kw, kw, kw);
    }
    if (category) {
      where += " AND pb.category = ?";
      params.push(category);
    }
    if (bookStatus && bookStatus !== "all") {
      where += " AND pb.status = ?";
      params.push(bookStatus);
    }

    const countResult = await query(`SELECT COUNT(*) as total FROM platform_book pb ${where}`, params);
    const books = await query(
      `SELECT pb.*, bcp.price, bcp.original_price, bcp.\`condition\`, bcp.condition_desc, bcp.stock, bcp.id as bcp_id,
        bc.name as category_name
      FROM platform_book pb
      LEFT JOIN book_condition_price bcp ON pb.id = bcp.book_id AND bcp.type = 'platform'
      LEFT JOIN book_category bc ON pb.category = bc.id
      ${where}
      ORDER BY pb.create_datetime DESC LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    res.send({
      status: 200,
      message: "获取平台图书列表成功",
      data: { list: books, total: countResult[0].total, page, pageSize },
    });
  } catch (err) {
    res.cc(err);
  }
};

exports.addPlatformBook = async (req, res) => {
  try {
    const {
      isbn, title, author, publisher, publish_date, category, tags,
      status: bookStatus, cover_img, detail_imgs, description,
      condition, condition_desc, original_price, price, stock,
    } = req.body;
    if (!title || !author || !isbn) return res.cc("请填写必要信息（ISBN、书名、作者）", 400);

    const result = await query("INSERT INTO platform_book SET ?", {
      user_id: req.auth.id, isbn, title, author,
      publisher: publisher || "", publish_date: publish_date || "",
      category: category || null, tags: tags || "",
      status: bookStatus || "onsale", cover_img: cover_img || "",
      detail_imgs: detail_imgs || "", description: description || "", sales_count: 0,
    });

    await query("INSERT INTO book_condition_price SET ?", {
      type: "platform", book_id: result.insertId,
      condition: condition || 10, condition_desc: condition_desc || "",
      original_price: original_price || price || 0, price: price || 0, stock: stock || 1,
    });

    res.send({ status: 200, message: "添加平台图书成功", data: { book_id: result.insertId } });
  } catch (err) {
    res.cc(err);
  }
};

exports.updatePlatformBook = async (req, res) => {
  try {
    const {
      id, isbn, title, author, publisher, publish_date, category, tags,
      status: bookStatus, cover_img, detail_imgs, description,
      condition, condition_desc, original_price, price, stock,
    } = req.body;
    if (!id) return res.cc("参数不完整", 400);

    await query(
      `UPDATE platform_book SET isbn=?, title=?, author=?, publisher=?, publish_date=?,
       category=?, tags=?, status=?, cover_img=?, detail_imgs=?, description=? WHERE id=?`,
      [isbn, title, author, publisher || "", publish_date || "", category || null,
       tags || "", bookStatus || "onsale", cover_img || "", detail_imgs || "", description || "", id]
    );

    const existing = await query("SELECT id FROM book_condition_price WHERE book_id=? AND type='platform'", [id]);
    if (existing.length > 0) {
      await query(
        "UPDATE book_condition_price SET `condition`=?, condition_desc=?, original_price=?, price=?, stock=? WHERE book_id=? AND type='platform'",
        [condition || 10, condition_desc || "", original_price || price || 0, price || 0, stock || 1, id]
      );
    } else {
      await query("INSERT INTO book_condition_price SET ?", {
        type: "platform", book_id: id, condition: condition || 10, condition_desc: condition_desc || "",
        original_price: original_price || price || 0, price: price || 0, stock: stock || 1,
      });
    }

    res.send({ status: 200, message: "更新平台图书成功" });
  } catch (err) {
    res.cc(err);
  }
};

exports.deletePlatformBook = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.cc("参数不完整", 400);
    await query("DELETE FROM book_condition_price WHERE book_id=? AND type='platform'", [id]);
    await query("DELETE FROM platform_book WHERE id=?", [id]);
    res.send({ status: 200, message: "删除平台图书成功" });
  } catch (err) {
    res.cc(err);
  }
};

// ===================== 用户图书管理 =====================

exports.getUserBooks = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 10));
    const offset = (page - 1) * pageSize;
    const keyword = req.query.keyword || "";
    const bookStatus = req.query.status || "";
    const category = req.query.category || "";

    let where = "WHERE 1=1";
    const params = [];

    if (keyword) {
      where += " AND (ub.title LIKE ? OR ub.author LIKE ? OR ub.isbn LIKE ?)";
      const kw = `%${keyword}%`;
      params.push(kw, kw, kw);
    }
    if (bookStatus && bookStatus !== "all") {
      where += " AND ub.status = ?";
      params.push(bookStatus);
    }
    if (category) {
      where += " AND ub.category = ?";
      params.push(category);
    }

    const countResult = await query(`SELECT COUNT(*) as total FROM user_book ub ${where}`, params);
    const books = await query(
      `SELECT ub.*, bcp.price, bcp.original_price, bcp.\`condition\`, bcp.condition_desc, bcp.stock,
        bc.name as category_name, u.username, u.nickname as seller_name
      FROM user_book ub
      LEFT JOIN book_condition_price bcp ON ub.id = bcp.book_id AND bcp.type = 'user'
      LEFT JOIN book_category bc ON ub.category = bc.id
      LEFT JOIN user u ON ub.user_id = u.id
      ${where}
      ORDER BY ub.create_datetime DESC LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    res.send({
      status: 200,
      message: "获取用户图书列表成功",
      data: { list: books, total: countResult[0].total, page, pageSize },
    });
  } catch (err) {
    res.cc(err);
  }
};

exports.updateUserBookStatus = async (req, res) => {
  try {
    const { id, status } = req.body;
    if (!id || !["onsale", "offline", "reviewing", "violation"].includes(status)) return res.cc("参数错误", 400);
    await query("UPDATE user_book SET status=? WHERE id=?", [status, id]);
    res.send({ status: 200, message: "更新图书状态成功" });
  } catch (err) {
    res.cc(err);
  }
};

// ===================== 书籍审核 =====================

exports.getBookAuditList = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 10));
    const offset = (page - 1) * pageSize;
    const tab = req.query.tab || "pending"; // pending=待审核, history=审核记录

    if (tab === "history") {
      const countResult = await query("SELECT COUNT(*) as total FROM book_audit");
      const records = await query(
        `SELECT ba.*, ub.title, ub.cover_img, ub.author, u.username as seller_name, a.username as admin_name
        FROM book_audit ba
        LEFT JOIN user_book ub ON ba.book_id = ub.id AND ba.book_type = 'user'
        LEFT JOIN user u ON ub.user_id = u.id
        LEFT JOIN user a ON ba.admin_id = a.id
        ORDER BY ba.created_at DESC LIMIT ? OFFSET ?`,
        [pageSize, offset]
      );
      return res.send({
        status: 200, message: "获取审核记录成功",
        data: { list: records, total: countResult[0].total, page, pageSize },
      });
    }

    // 待审核的用户图书
    const countResult = await query("SELECT COUNT(*) as total FROM user_book WHERE status = 'reviewing'");
    const books = await query(
      `SELECT ub.*, bcp.price, bcp.original_price, bcp.\`condition\`, bcp.condition_desc,
        u.username, u.nickname as seller_name, bc.name as category_name
      FROM user_book ub
      LEFT JOIN book_condition_price bcp ON ub.id = bcp.book_id AND bcp.type = 'user'
      LEFT JOIN user u ON ub.user_id = u.id
      LEFT JOIN book_category bc ON ub.category = bc.id
      WHERE ub.status = 'reviewing'
      ORDER BY ub.create_datetime DESC LIMIT ? OFFSET ?`,
      [pageSize, offset]
    );

    res.send({
      status: 200, message: "获取待审核列表成功",
      data: { list: books, total: countResult[0].total, page, pageSize },
    });
  } catch (err) {
    res.cc(err);
  }
};

exports.auditBook = async (req, res) => {
  try {
    const adminId = req.auth.id;
    const { book_id, book_type, action, reason } = req.body;

    if (!book_id || !action) return res.cc("参数不完整", 400);
    if (!["approve", "reject", "violation"].includes(action)) return res.cc("操作类型无效", 400);
    if ((action === "reject" || action === "violation") && !reason) return res.cc("请填写驳回/违规理由", 400);

    const statusMap = { approve: "onsale", reject: "offline", violation: "violation" };
    const newStatus = statusMap[action];
    const type = book_type || "user";
    const table = type === "platform" ? "platform_book" : "user_book";

    await query(`UPDATE ${table} SET status = ? WHERE id = ?`, [newStatus, book_id]);
    await query("INSERT INTO book_audit SET ?", {
      book_id, book_type: type, action, reason: reason || null, admin_id: adminId,
    });

    res.send({ status: 200, message: "审核操作成功" });
  } catch (err) {
    res.cc(err);
  }
};

// ===================== 订单管理 =====================

exports.getOrders = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 10));
    const offset = (page - 1) * pageSize;
    const orderStatus = req.query.status || "";
    const keyword = req.query.keyword || "";
    const startDate = req.query.startDate || "";
    const endDate = req.query.endDate || "";

    let where = "WHERE 1=1";
    const params = [];

    if (orderStatus && orderStatus !== "all") {
      where += " AND o.status = ?";
      params.push(orderStatus);
    }
    if (keyword) {
      where += " AND (o.order_no LIKE ? OR u.username LIKE ? OR u.nickname LIKE ?)";
      const kw = `%${keyword}%`;
      params.push(kw, kw, kw);
    }
    if (startDate) {
      where += " AND o.created_at >= ?";
      params.push(startDate);
    }
    if (endDate) {
      where += " AND o.created_at <= ?";
      params.push(endDate + " 23:59:59");
    }

    const countResult = await query(
      `SELECT COUNT(*) as total FROM orders o LEFT JOIN user u ON o.user_id = u.id ${where}`, params
    );
    const orders = await query(
      `SELECT o.*, u.username, u.nickname
      FROM orders o LEFT JOIN user u ON o.user_id = u.id
      ${where}
      ORDER BY o.created_at DESC LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    if (orders.length > 0) {
      const orderIds = orders.map((o) => o.id);
      const placeholders = orderIds.map(() => "?").join(",");
      const items = await query(
        `SELECT order_id, title, cover_img, price, quantity, book_id, book_type FROM order_items WHERE order_id IN (${placeholders})`,
        orderIds
      );
      const itemMap = {};
      items.forEach((item) => {
        if (!itemMap[item.order_id]) itemMap[item.order_id] = [];
        itemMap[item.order_id].push(item);
      });
      orders.forEach((o) => { o.items = itemMap[o.id] || []; });
    } else {
      orders.forEach((o) => { o.items = []; });
    }

    res.send({
      status: 200, message: "获取订单列表成功",
      data: { list: orders, total: countResult[0].total, page, pageSize },
    });
  } catch (err) {
    res.cc(err);
  }
};

exports.updateAdminOrderStatus = async (req, res) => {
  try {
    const { order_id, status: newStatus } = req.body;
    const validStatus = ["pending", "paid", "shipped", "completed", "cancelled"];
    if (!order_id || !validStatus.includes(newStatus)) return res.cc("参数错误", 400);

    const timeField = { paid: "pay_time", shipped: "ship_time", completed: "receive_time" };
    let sql = "UPDATE orders SET status=?";
    const params = [newStatus];
    if (timeField[newStatus]) sql += `, ${timeField[newStatus]}=NOW()`;
    sql += " WHERE id=?";
    params.push(order_id);

    const result = await query(sql, params);
    if (result.affectedRows === 0) return res.cc("订单不存在", 404);

    if (newStatus === "cancelled") {
      const items = await query("SELECT book_id, book_type, quantity FROM order_items WHERE order_id=?", [order_id]);
      for (const item of items) {
        await query("UPDATE book_condition_price SET stock=stock+? WHERE book_id=? AND type COLLATE utf8mb4_unicode_ci=?",
          [item.quantity, item.book_id, item.book_type]);
      }
    }
    if (newStatus === "completed") {
      const items = await query("SELECT book_id, book_type, seller_id, price, quantity FROM order_items WHERE order_id=?", [order_id]);
      for (const item of items) {
        if (item.book_type === "platform") {
          await query("UPDATE platform_book SET sales_count=sales_count+? WHERE id=?", [item.quantity, item.book_id]);
        } else {
          await query("UPDATE user_book SET nope=nope+? WHERE id=?", [item.quantity, item.book_id]);
          if (item.seller_id) {
            const earnings = parseFloat((item.price * item.quantity).toFixed(2));
            await query("UPDATE user SET account = COALESCE(account, 0) + ? WHERE id=?", [earnings, item.seller_id]);
          }
        }
      }
    }

    res.send({ status: 200, message: "订单状态更新成功" });
  } catch (err) {
    res.cc(err);
  }
};

exports.getOrderDetail = async (req, res) => {
  try {
    const { order_id } = req.query;
    if (!order_id) return res.cc("缺少参数", 400);

    const orders = await query(
      `SELECT o.*, u.username, u.nickname FROM orders o LEFT JOIN user u ON o.user_id = u.id WHERE o.id = ?`,
      [order_id]
    );
    if (orders.length === 0) return res.cc("订单不存在", 404);

    const order = orders[0];
    if (order.address_snapshot && typeof order.address_snapshot === "string") {
      try { order.address_snapshot = JSON.parse(order.address_snapshot); } catch (e) { /* ignore */ }
    }
    order.items = await query("SELECT * FROM order_items WHERE order_id=?", [order_id]);

    res.send({ status: 200, message: "获取订单详情成功", data: order });
  } catch (err) {
    res.cc(err);
  }
};

// ===================== 退款/售后管理 =====================

exports.getRefundList = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 10));
    const offset = (page - 1) * pageSize;
    const refundStatus = req.query.status || "";
    const keyword = req.query.keyword || "";

    let where = "WHERE 1=1";
    const params = [];

    if (refundStatus && refundStatus !== "all") {
      where += " AND r.status = ?";
      params.push(refundStatus);
    }
    if (keyword) {
      where += " AND (r.order_no LIKE ? OR u.username LIKE ? OR u.nickname LIKE ?)";
      const kw = `%${keyword}%`;
      params.push(kw, kw, kw);
    }

    const countResult = await query(
      `SELECT COUNT(*) as total FROM refund r LEFT JOIN user u ON r.user_id = u.id ${where}`, params
    );
    const refunds = await query(
      `SELECT r.*, u.username, u.nickname
      FROM refund r LEFT JOIN user u ON r.user_id = u.id
      ${where}
      ORDER BY r.created_at DESC LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    res.send({
      status: 200, message: "获取退款列表成功",
      data: { list: refunds, total: countResult[0].total, page, pageSize },
    });
  } catch (err) {
    res.cc(err);
  }
};

exports.updateRefundStatus = async (req, res) => {
  try {
    const { id, status, admin_note } = req.body;
    const validStatus = ["approved", "rejected", "negotiating"];
    if (!id || !validStatus.includes(status)) return res.cc("参数错误", 400);

    await query("UPDATE refund SET status=?, admin_note=? WHERE id=?", [status, admin_note || null, id]);

    // 退款通过：退回金额到用户余额
    if (status === "approved") {
      const refunds = await query("SELECT * FROM refund WHERE id=?", [id]);
      if (refunds.length > 0 && refunds[0].amount > 0) {
        await query("UPDATE user SET account = COALESCE(account, 0) + ? WHERE id=?",
          [refunds[0].amount, refunds[0].user_id]);
      }
    }

    res.send({ status: 200, message: "退款状态更新成功" });
  } catch (err) {
    res.cc(err);
  }
};

// ===================== 订单统计 =====================

exports.getOrderStats = async (req, res) => {
  try {
    const { type = "daily", startDate, endDate } = req.query;
    let dateWhere = "";
    const dateParams = [];

    if (startDate) { dateWhere += " AND o.created_at >= ?"; dateParams.push(startDate); }
    if (endDate) { dateWhere += " AND o.created_at <= ?"; dateParams.push(endDate + " 23:59:59"); }

    // 时间维度统计
    let dateFormat;
    if (type === "weekly") dateFormat = "DATE_FORMAT(o.created_at, '%Y-W%u')";
    else if (type === "monthly") dateFormat = "DATE_FORMAT(o.created_at, '%Y-%m')";
    else dateFormat = "DATE(o.created_at)";

    const timeStats = await query(
      `SELECT ${dateFormat} as period, COUNT(*) as order_count,
        SUM(total_amount) as total_amount,
        SUM(CASE WHEN status='completed' THEN total_amount ELSE 0 END) as completed_amount
      FROM orders o WHERE 1=1 ${dateWhere}
      GROUP BY period ORDER BY period DESC LIMIT 30`,
      dateParams
    );

    // 分类维度统计
    const categoryStats = await query(
      `SELECT COALESCE(bc.name, '未分类') as category_name,
        COUNT(DISTINCT o.id) as order_count,
        SUM(oi.price * oi.quantity) as total_amount
      FROM order_items oi
      LEFT JOIN orders o ON oi.order_id = o.id
      LEFT JOIN platform_book pb ON oi.book_id = pb.id AND oi.book_type='platform'
      LEFT JOIN user_book ub ON oi.book_id = ub.id AND oi.book_type='user'
      LEFT JOIN book_category bc ON COALESCE(pb.category, ub.category) = bc.id
      WHERE 1=1 ${dateWhere.replace(/o\.created_at/g, 'o.created_at')}
      GROUP BY category_name ORDER BY total_amount DESC`,
      dateParams
    );

    // 地区维度统计（跳过无效 JSON 行，避免 JSON_EXTRACT 报错）
    let regionStats = [];
    try {
      regionStats = await query(
        `SELECT COALESCE(JSON_UNQUOTE(JSON_EXTRACT(address_snapshot, '$.province')), '未知') as province,
          COUNT(*) as order_count, SUM(total_amount) as total_amount
        FROM orders o
        WHERE address_snapshot IS NOT NULL AND JSON_VALID(address_snapshot) = 1 ${dateWhere}
        GROUP BY province ORDER BY order_count DESC LIMIT 20`,
        dateParams
      );
    } catch (e) { regionStats = []; }

    // 总览
    const summary = await query(
      `SELECT COUNT(*) as total_orders, SUM(total_amount) as total_amount,
        SUM(CASE WHEN status='completed' THEN total_amount ELSE 0 END) as completed_amount,
        SUM(CASE WHEN status='cancelled' THEN 1 ELSE 0 END) as cancelled_count,
        AVG(total_amount) as avg_amount
      FROM orders o WHERE 1=1 ${dateWhere}`,
      dateParams
    );

    res.send({
      status: 200, message: "获取订单统计成功",
      data: { summary: summary[0], timeStats, categoryStats, regionStats },
    });
  } catch (err) {
    res.cc(err);
  }
};

// ===================== 支付记录 =====================

exports.getPaymentList = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 10));
    const offset = (page - 1) * pageSize;
    const payStatus = req.query.status || "";
    const keyword = req.query.keyword || "";

    let where = "WHERE 1=1";
    const params = [];

    if (payStatus && payStatus !== "all") { where += " AND p.status = ?"; params.push(payStatus); }
    if (keyword) {
      where += " AND (p.order_no LIKE ? OR p.transaction_no LIKE ? OR u.username LIKE ?)";
      const kw = `%${keyword}%`;
      params.push(kw, kw, kw);
    }

    const countResult = await query(
      `SELECT COUNT(*) as total FROM payment_record p LEFT JOIN user u ON p.user_id = u.id ${where}`, params
    );
    const records = await query(
      `SELECT p.*, u.username, u.nickname
      FROM payment_record p LEFT JOIN user u ON p.user_id = u.id
      ${where} ORDER BY p.created_at DESC LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    const summary = await query(
      `SELECT COUNT(*) as total_count,
        SUM(CASE WHEN p.status='success' THEN amount ELSE 0 END) as success_amount,
        SUM(CASE WHEN p.status='refunded' THEN amount ELSE 0 END) as refunded_amount
      FROM payment_record p LEFT JOIN user u ON p.user_id = u.id ${where}`,
      params
    );

    res.send({
      status: 200, message: "获取支付记录成功",
      data: { list: records, total: countResult[0].total, page, pageSize, summary: summary[0] },
    });
  } catch (err) {
    res.cc(err);
  }
};

// ===================== 提现管理 =====================

exports.getWithdrawalList = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 10));
    const offset = (page - 1) * pageSize;
    const wStatus = req.query.status || "";

    let where = "WHERE 1=1";
    const params = [];
    if (wStatus && wStatus !== "all") { where += " AND w.status = ?"; params.push(wStatus); }

    const countResult = await query(`SELECT COUNT(*) as total FROM withdrawal w ${where}`, params);
    const records = await query(
      `SELECT w.*, u.username, u.nickname, u.account as user_balance
      FROM withdrawal w LEFT JOIN user u ON w.user_id = u.id
      ${where} ORDER BY w.created_at DESC LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    res.send({
      status: 200, message: "获取提现记录成功",
      data: { list: records, total: countResult[0].total, page, pageSize },
    });
  } catch (err) {
    res.cc(err);
  }
};

exports.updateWithdrawalStatus = async (req, res) => {
  try {
    const { id, status, admin_note } = req.body;
    if (!id || !["approved", "rejected"].includes(status)) return res.cc("参数错误", 400);

    const withdrawals = await query("SELECT * FROM withdrawal WHERE id=?", [id]);
    if (withdrawals.length === 0) return res.cc("提现记录不存在", 404);

    await query("UPDATE withdrawal SET status=?, admin_note=? WHERE id=?", [status, admin_note || null, id]);

    // 驳回：退回金额到用户余额
    if (status === "rejected") {
      await query("UPDATE user SET account = COALESCE(account, 0) + ? WHERE id=?",
        [withdrawals[0].amount, withdrawals[0].user_id]);
    }

    res.send({ status: 200, message: "提现处理成功" });
  } catch (err) {
    res.cc(err);
  }
};

// ===================== 优惠券管理 =====================

exports.getCouponList = async (req, res) => {
  try {
    const coupons = await query("SELECT * FROM coupon ORDER BY created_at DESC");
    res.send({ status: 200, message: "获取优惠券列表成功", data: coupons });
  } catch (err) {
    res.cc(err);
  }
};

exports.addCoupon = async (req, res) => {
  try {
    const { name, type, value, min_amount, start_time, end_time, total_count, status } = req.body;
    if (!name || !type || !value || !start_time || !end_time) return res.cc("请填写必要信息", 400);

    await query("INSERT INTO coupon SET ?", {
      name, type, value, min_amount: min_amount || 0,
      start_time, end_time, total_count: total_count || 0,
      used_count: 0, status: status !== undefined ? status : 1,
    });
    res.send({ status: 200, message: "添加优惠券成功" });
  } catch (err) {
    res.cc(err);
  }
};

exports.updateCoupon = async (req, res) => {
  try {
    const { id, name, type, value, min_amount, start_time, end_time, total_count, status } = req.body;
    if (!id) return res.cc("参数不完整", 400);

    await query(
      `UPDATE coupon SET name=?, type=?, value=?, min_amount=?, start_time=?, end_time=?, total_count=?, status=? WHERE id=?`,
      [name, type, value, min_amount || 0, start_time, end_time, total_count || 0, status, id]
    );
    res.send({ status: 200, message: "更新优惠券成功" });
  } catch (err) {
    res.cc(err);
  }
};

exports.deleteCoupon = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.cc("参数不完整", 400);
    await query("DELETE FROM user_coupon WHERE coupon_id=?", [id]);
    await query("DELETE FROM coupon WHERE id=?", [id]);
    res.send({ status: 200, message: "删除优惠券成功" });
  } catch (err) {
    res.cc(err);
  }
};

// ===================== 帖子管理 =====================

exports.getDiscoverPosts = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 10));
    const offset = (page - 1) * pageSize;
    const keyword = req.query.keyword || "";
    const status = req.query.status || "";

    let where = "WHERE 1=1";
    const params = [];

    if (keyword) {
      where += " AND (p.content LIKE ? OR u.username LIKE ? OR u.nickname LIKE ?)";
      const kw = `%${keyword}%`;
      params.push(kw, kw, kw);
    }
    if (status && status !== "all") {
      where += " AND p.status = ?";
      params.push(Number(status));
    }

    const countResult = await query(`SELECT COUNT(*) as total FROM discover_post p LEFT JOIN user u ON p.user_id = u.id ${where}`, params);
    const posts = await query(
      `SELECT p.id, p.user_id, p.content, p.images, p.like_count, p.comment_count, p.create_time, p.status,
             u.username, u.nickname
      FROM discover_post p
      LEFT JOIN user u ON p.user_id = u.id
      ${where}
      ORDER BY p.create_time DESC LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    res.send({
      status: 200,
      message: "获取帖子列表成功",
      data: { list: posts, total: countResult[0].total, page, pageSize },
    });
  } catch (err) {
    res.cc(err);
  }
};

exports.deleteDiscoverPost = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.cc("参数不完整", 400);

    // 删除相关点赞记录
    await query("DELETE FROM discover_post_like WHERE post_id=?", [id]);
    // 删除相关评论记录
    await query("DELETE FROM discover_post_comment WHERE post_id=?", [id]);
    // 删除帖子
    await query("DELETE FROM discover_post WHERE id=?", [id]);

    res.send({ status: 200, message: "删除帖子成功" });
  } catch (err) {
    res.cc(err);
  }
};

exports.getDiscoverComments = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 10));
    const offset = (page - 1) * pageSize;
    const postId = req.query.post_id || "";
    const keyword = req.query.keyword || "";

    let where = "WHERE 1=1";
    const params = [];

    if (postId) {
      where += " AND c.post_id = ?";
      params.push(postId);
    }
    if (keyword) {
      where += " AND (c.content LIKE ? OR u.username LIKE ? OR u.nickname LIKE ?)";
      const kw = `%${keyword}%`;
      params.push(kw, kw, kw);
    }

    const countResult = await query(
      `SELECT COUNT(*) as total FROM discover_post_comment c LEFT JOIN user u ON c.user_id = u.id ${where}`,
      params
    );
    const comments = await query(
      `SELECT c.id, c.post_id, c.user_id, c.content, c.create_time, c.status,
             u.username, u.nickname,
             p.content as post_content
      FROM discover_post_comment c
      LEFT JOIN user u ON c.user_id = u.id
      LEFT JOIN discover_post p ON c.post_id = p.id
      ${where}
      ORDER BY c.create_time DESC LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    res.send({
      status: 200,
      message: "获取评论列表成功",
      data: { list: comments, total: countResult[0].total, page, pageSize },
    });
  } catch (err) {
    res.cc(err);
  }
};

exports.deleteDiscoverComment = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.cc("参数不完整", 400);

    await query("DELETE FROM discover_post_comment WHERE id=?", [id]);

    res.send({ status: 200, message: "删除评论成功" });
  } catch (err) {
    res.cc(err);
  }
};
