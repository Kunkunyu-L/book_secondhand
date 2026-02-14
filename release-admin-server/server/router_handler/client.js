const db = require("../db/config");

// ==================== 退款申请 ====================

// 用户提交退款申请
exports.applyRefund = (req, res) => {
  const userId = req.auth.id;
  const { order_id, reason } = req.body;
  if (!order_id || !reason) return res.cc("请填写退款原因", 400);

  // 检查订单属于该用户且状态允许退款
  db.query("SELECT * FROM orders WHERE id=? AND user_id=?", [order_id, userId], (err, orders) => {
    if (err) return res.cc(err);
    if (orders.length === 0) return res.cc("订单不存在", 404);
    const order = orders[0];
    if (!["paid", "shipped", "completed"].includes(order.status)) {
      return res.cc("当前订单状态不支持退款", 400);
    }
    // 检查是否已有退款申请
    db.query("SELECT id FROM refund WHERE order_id=? AND status IN ('pending','approved')", [order_id], (err2, existing) => {
      if (err2) return res.cc(err2);
      if (existing.length > 0) return res.cc("已有退款申请进行中", 400);

      const sql = "INSERT INTO refund (order_id, user_id, amount, reason, status) VALUES (?, ?, ?, ?, 'pending')";
      db.query(sql, [order_id, userId, order.total_amount, reason], (err3, result) => {
        if (err3) return res.cc(err3);
        const refundId = result.insertId;
        // 通知管理员：新售后/退款申请
        const io = req.app.get("io");
        if (io) {
          const title = "新售后申请";
          const content = `订单号：${order.order_no || order_id}，退款金额：¥${Number(order.total_amount).toFixed(2)}，原因：${reason}`;
          db.query(
            "INSERT INTO notification (user_id, title, content, type) VALUES (0, ?, ?, 'refund')",
            [title, content],
            (errN) => {
              if (!errN) {
                io.to("admin_room").emit("notification", {
                  type: "refund",
                  title,
                  content,
                  order_id,
                  refund_id: refundId,
                  created_at: new Date(),
                });
              }
            }
          );
        }
        res.send({ status: 200, message: "退款申请已提交", data: { id: refundId } });
      });
    });
  });
};

// 用户查看自己的退款记录
exports.getMyRefunds = (req, res) => {
  const userId = req.auth.id;
  const sql = `SELECT r.*, o.order_no FROM refund r 
    LEFT JOIN orders o ON r.order_id=o.id 
    WHERE r.user_id=? ORDER BY r.created_at DESC`;
  db.query(sql, [userId], (err, results) => {
    if (err) return res.cc(err);
    res.send({ status: 200, message: "获取退款记录成功", data: results });
  });
};

// ==================== 咨询工单 ====================

// 用户创建工单（表结构无 related_order_id 时仅写入已有字段）
exports.createTicket = (req, res) => {
  const userId = req.auth.id;
  const { title, content } = req.body;
  if (!title || !content) return res.cc("请填写工单标题和内容", 400);

  const sql = "INSERT INTO service_ticket (user_id, type, title, content, status, priority) VALUES (?, 'consultation', ?, ?, 'pending', 'normal')";
  db.query(sql, [userId, title.trim(), content.trim()], (err, result) => {
    if (err) return res.cc(err);
    res.send({ status: 200, message: "工单已创建", data: { id: result.insertId } });
  });
};

// 用户查看自己的工单
exports.getMyTickets = (req, res) => {
  const userId = req.auth.id;
  const sql = "SELECT * FROM service_ticket WHERE user_id=? ORDER BY created_at DESC";
  db.query(sql, [userId], (err, results) => {
    if (err) return res.cc(err);
    res.send({ status: 200, message: "获取工单列表成功", data: results });
  });
};

// 用户查看工单详情
exports.getTicketDetail = (req, res) => {
  const userId = req.auth.id;
  const { id } = req.query;
  if (!id) return res.cc("缺少参数", 400);
  db.query("SELECT * FROM service_ticket WHERE id=? AND user_id=?", [id, userId], (err, results) => {
    if (err) return res.cc(err);
    if (results.length === 0) return res.cc("工单不存在", 404);
    res.send({ status: 200, message: "获取工单详情成功", data: results[0] });
  });
};

// ==================== 我的优惠券 ====================

// 领取优惠券
exports.claimCoupon = (req, res) => {
  const userId = req.auth.id;
  const { coupon_id } = req.body;
  if (!coupon_id) return res.cc("缺少参数", 400);

  // 检查优惠券是否存在和可领取
  db.query("SELECT * FROM coupon WHERE id=? AND status=1 AND end_time > NOW()", [coupon_id], (err, coupons) => {
    if (err) return res.cc(err);
    if (coupons.length === 0) return res.cc("优惠券不存在或已过期", 400);
    const coupon = coupons[0];
    if (coupon.total_count > 0 && coupon.used_count >= coupon.total_count) {
      return res.cc("优惠券已领完", 400);
    }
    // 检查是否已领取
    db.query("SELECT id FROM user_coupon WHERE user_id=? AND coupon_id=?", [userId, coupon_id], (err2, existing) => {
      if (err2) return res.cc(err2);
      if (existing.length > 0) return res.cc("您已领取过该优惠券", 400);

      db.query("INSERT INTO user_coupon (user_id, coupon_id, status) VALUES (?, ?, 'unused')", [userId, coupon_id], (err3) => {
        if (err3) return res.cc(err3);
        // 更新已领取数量
        db.query("UPDATE coupon SET used_count=used_count+1 WHERE id=?", [coupon_id]);
        res.send({ status: 200, message: "领取成功" });
      });
    });
  });
};

// 我的优惠券列表
exports.getMyCoupons = (req, res) => {
  const userId = req.auth.id;
  const { status } = req.query; // unused / used / expired
  let sql = `SELECT uc.id, uc.status AS use_status, uc.used_at, 
    c.id AS coupon_id, c.name, c.type, c.discount_value, c.min_amount, c.start_time, c.end_time
    FROM user_coupon uc LEFT JOIN coupon c ON uc.coupon_id=c.id WHERE uc.user_id=?`;
  const params = [userId];
  if (status === "unused") {
    sql += " AND uc.status='unused' AND c.end_time > NOW()";
  } else if (status === "used") {
    sql += " AND uc.status='used'";
  } else if (status === "expired") {
    sql += " AND (uc.status='expired' OR (uc.status='unused' AND c.end_time <= NOW()))";
  }
  sql += " ORDER BY uc.created_at DESC";
  db.query(sql, params, (err, results) => {
    if (err) return res.cc(err);
    res.send({ status: 200, message: "获取优惠券列表成功", data: results });
  });
};

// ==================== 通知中心 ====================

// 获取我的通知
exports.getMyNotifications = (req, res) => {
  const userId = req.auth.id;
  const sql = "SELECT * FROM notification WHERE user_id=? ORDER BY created_at DESC LIMIT 50";
  db.query(sql, [userId], (err, results) => {
    if (err) return res.cc(err);
    res.send({ status: 200, message: "获取通知成功", data: results });
  });
};

// 标记通知已读
exports.markNotificationRead = (req, res) => {
  const userId = req.auth.id;
  const { id } = req.body; // 单条id，不传则全部已读
  let sql, params;
  if (id) {
    sql = "UPDATE notification SET is_read=1 WHERE id=? AND user_id=?";
    params = [id, userId];
  } else {
    sql = "UPDATE notification SET is_read=1 WHERE user_id=? AND is_read=0";
    params = [userId];
  }
  db.query(sql, params, (err) => {
    if (err) return res.cc(err);
    res.send({ status: 200, message: "操作成功" });
  });
};

// 获取未读通知数量
exports.getUnreadCount = (req, res) => {
  const userId = req.auth.id;
  db.query("SELECT COUNT(*) AS count FROM notification WHERE user_id=? AND is_read=0", [userId], (err, results) => {
    if (err) return res.cc(err);
    res.send({ status: 200, message: "获取成功", data: { count: results[0].count } });
  });
};
