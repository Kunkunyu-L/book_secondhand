const db = require("../db/config");

// 生成订单编号
function generateOrderNo() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const h = String(now.getHours()).padStart(2, "0");
  const mi = String(now.getMinutes()).padStart(2, "0");
  const s = String(now.getSeconds()).padStart(2, "0");
  const rand = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
  return `${y}${m}${d}${h}${mi}${s}${rand}`;
}

// 创建订单（从购物车选中项或直接购买）
exports.createOrder = (req, res) => {
  const userId = req.auth.id;
  const { address_id, items, remark } = req.body;
  // items: [{ book_id, book_type, quantity }] 直接购买时传入
  // 如果没传items，从购物车选中项创建

  if (!address_id) return res.cc("请选择收货地址", 400);

  // 先获取地址快照
  db.query("SELECT * FROM address WHERE id=? AND user_id=?", [address_id, userId], (err, addrResults) => {
    if (err) return res.cc(err);
    if (addrResults.length === 0) return res.cc("地址不存在", 400);
    const addressSnapshot = JSON.stringify(addrResults[0]);

    const processItems = (orderItems) => {
      if (!orderItems || orderItems.length === 0) return res.cc("没有可下单的商品", 400);

      // 计算总金额并获取商品信息
      let totalAmount = 0;
      const itemDetails = [];
      let processed = 0;

      orderItems.forEach((item) => {
        const table = item.book_type === "platform" ? "platform_book" : "user_book";
        const sql = `
          SELECT b.title, b.cover_img, b.user_id AS seller_id, bcp.price, bcp.stock
          FROM ${table} b
          LEFT JOIN book_condition_price bcp ON b.id = bcp.book_id AND bcp.type COLLATE utf8mb4_unicode_ci = ?
          WHERE b.id = ? AND b.status COLLATE utf8mb4_unicode_ci = 'onsale'
        `;
        db.query(sql, [item.book_type, item.book_id], (err2, bookResults) => {
          processed++;
          if (!err2 && bookResults.length > 0) {
            const book = bookResults[0];
            if (book.stock >= item.quantity) {
              totalAmount += book.price * item.quantity;
              itemDetails.push({
                book_id: item.book_id,
                book_type: item.book_type,
                title: book.title,
                cover_img: book.cover_img,
                price: book.price,
                quantity: item.quantity,
                seller_id: book.seller_id,
              });
            }
          }
          if (processed === orderItems.length) {
            if (itemDetails.length === 0) return res.cc("商品不可购买（已下架或库存不足）", 400);
            insertOrder(totalAmount, itemDetails);
          }
        });
      });
    };

    const insertOrder = (totalAmount, itemDetails) => {
      const orderNo = generateOrderNo();
      const orderSql = "INSERT INTO orders SET ?";
      const orderData = {
        order_no: orderNo,
        user_id: userId,
        total_amount: totalAmount,
        status: "pending",
        address_snapshot: addressSnapshot,
        remark: remark || null,
      };

      db.query(orderSql, orderData, (err3, orderResult) => {
        if (err3) return res.cc(err3);
        const orderId = orderResult.insertId;

        // 批量插入订单明细
        const itemValues = itemDetails.map((d) => [
          orderId, d.book_id, d.book_type, d.title, d.cover_img, d.price, d.quantity, d.seller_id,
        ]);
        const itemSql = "INSERT INTO order_items (order_id, book_id, book_type, title, cover_img, price, quantity, seller_id) VALUES ?";
        db.query(itemSql, [itemValues], (err4) => {
          if (err4) return res.cc(err4);

          // 扣减库存
          itemDetails.forEach((d) => {
            db.query(
              "UPDATE book_condition_price SET stock=stock-? WHERE book_id=? AND type COLLATE utf8mb4_unicode_ci = ?",
              [d.quantity, d.book_id, d.book_type]
            );
          });

          // 如果是从购物车下单，删除购物车中已购买的项
          if (!items) {
            db.query("DELETE FROM cart WHERE user_id=? AND selected=1", [userId]);
          }

          // 通知管理员：新订单（站内通知 + 实时推送）
          const io = req.app.get("io");
          if (io) {
            db.query(
              "INSERT INTO notification (user_id, title, content, type) VALUES (0, ?, ?, 'order')",
              ["新订单", `订单号：${orderNo}，金额：¥${totalAmount.toFixed(2)}`],
              (errN) => {
                if (!errN) {
                  io.to("admin_room").emit("notification", {
                    type: "order",
                    title: "新订单",
                    content: `订单号：${orderNo}，金额：¥${totalAmount.toFixed(2)}`,
                    order_no: orderNo,
                    order_id: orderId,
                    created_at: new Date(),
                  });
                }
              }
            );
          }

          res.send({
            status: 200,
            message: "下单成功",
            data: { order_id: orderId, order_no: orderNo, total_amount: totalAmount },
          });
        });
      });
    };

    // 判断是直接购买还是从购物车
    if (items && items.length > 0) {
      processItems(items);
    } else {
      // 从购物车选中项
      const cartSql = "SELECT book_id, book_type, quantity FROM cart WHERE user_id=? AND selected=1";
      db.query(cartSql, [userId], (err2, cartResults) => {
        if (err2) return res.cc(err2);
        processItems(cartResults);
      });
    }
  });
};

// 获取订单列表（status: all/bought/sold，兼容 MySQL 5.5 无 JSON_ARRAYAGG）
const attachOrderItems = (orders, done) => {
  if (!orders || orders.length === 0) return done([]);
  const ids = orders.map((o) => o.id);
  const placeholders = ids.map(() => "?").join(",");
  const sql = `SELECT order_id, title, cover_img, price, quantity, book_id, book_type FROM order_items WHERE order_id IN (${placeholders})`;
  db.query(sql, ids, (err, rows) => {
    if (err) return done(null, err);
    const byOrder = {};
    (rows || []).forEach((r) => {
      if (!byOrder[r.order_id]) byOrder[r.order_id] = [];
      byOrder[r.order_id].push({ title: r.title, cover_img: r.cover_img, price: r.price, quantity: r.quantity, book_id: r.book_id, book_type: r.book_type });
    });
    orders.forEach((o) => { o.items = byOrder[o.id] || []; });
    done(orders);
  });
};

exports.getOrderList = (req, res) => {
  const userId = req.auth.id;
  const { status } = req.query;

  if (status === "all") {
    const boughtSql = `SELECT o.* FROM orders o WHERE o.user_id=? ORDER BY o.created_at DESC`;
    const soldSql = `SELECT DISTINCT o.* FROM orders o JOIN order_items oi ON oi.order_id=o.id AND oi.seller_id=? ORDER BY o.created_at DESC`;
    db.query(boughtSql, [userId], (err1, bought) => {
      if (err1) return res.cc(err1);
      db.query(soldSql, [userId], (err2, sold) => {
        if (err2) return res.cc(err2);
        const seen = new Set((bought || []).map((o) => o.id));
        const merged = [...(bought || [])];
        (sold || []).forEach((o) => { if (!seen.has(o.id)) { seen.add(o.id); merged.push(o); } });
        merged.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        attachOrderItems(merged, (data, e) => {
          if (e) return res.cc(e);
          res.send({ status: 200, message: "获取订单列表成功", data });
        });
      });
    });
    return;
  }

  if (status === "sold") {
    const sql = `SELECT DISTINCT o.* FROM orders o JOIN order_items oi ON oi.order_id=o.id AND oi.seller_id=? ORDER BY o.created_at DESC`;
    db.query(sql, [userId], (err, results) => {
      if (err) return res.cc(err);
      attachOrderItems(results || [], (data, e) => {
        if (e) return res.cc(e);
        res.send({ status: 200, message: "获取订单列表成功", data });
      });
    });
    return;
  }

  // bought：我买到的
  const sql = `SELECT o.* FROM orders o WHERE o.user_id=? ORDER BY o.created_at DESC`;
  db.query(sql, [userId], (err, results) => {
    if (err) return res.cc(err);
    attachOrderItems(results || [], (data, e) => {
      if (e) return res.cc(e);
      res.send({ status: 200, message: "获取订单列表成功", data });
    });
  });
};

// 获取订单详情（支持买家、卖家查看）
exports.getOrderDetail = (req, res) => {
  const userId = req.auth.id;
  const { order_id } = req.query;
  if (!order_id) return res.cc("缺少参数", 400);

  const sql = `SELECT o.* FROM orders o WHERE o.id=? AND (o.user_id=? OR EXISTS (SELECT 1 FROM order_items oi WHERE oi.order_id=o.id AND oi.seller_id=?))`;
  db.query(sql, [order_id, userId, userId], (err, orderResults) => {
    if (err) return res.cc(err);
    if (orderResults.length === 0) return res.cc("订单不存在", 404);

    const order = orderResults[0];
    order.role = order.user_id == userId ? "buyer" : "seller";
    if (order.address_snapshot && typeof order.address_snapshot === "string") {
      try { order.address_snapshot = JSON.parse(order.address_snapshot); } catch (e) {}
    }

    const itemSql = "SELECT * FROM order_items WHERE order_id=?";
    db.query(itemSql, [order_id], (err2, itemResults) => {
      if (err2) return res.cc(err2);
      order.items = itemResults;
      res.send({ status: 200, message: "获取订单详情成功", data: order });
    });
  });
};

// 更新订单状态（买家：paid/cancelled/completed；卖家：shipped）
exports.updateOrderStatus = (req, res) => {
  const userId = req.auth.id;
  const { order_id, status: newStatus } = req.body;
  const validStatus = ["paid", "shipped", "completed", "cancelled"];
  if (!order_id || !validStatus.includes(newStatus)) return res.cc("参数错误", 400);

  const timeField = { paid: "pay_time", shipped: "ship_time", completed: "receive_time" };

  db.query("SELECT user_id FROM orders WHERE id=?", [order_id], (err0, orderRows) => {
    if (err0) return res.cc(err0);
    if (!orderRows || orderRows.length === 0) return res.cc("订单不存在", 404);
    const isBuyer = orderRows[0].user_id == userId;

    if (newStatus === "shipped") {
      if (isBuyer) return res.cc("仅卖家可操作发货", 403);
      db.query("SELECT 1 FROM order_items WHERE order_id=? AND seller_id=? LIMIT 1", [order_id, userId], (errS, sellerRows) => {
        if (errS) return res.cc(errS);
        if (!sellerRows || sellerRows.length === 0) return res.cc("无权限操作", 403);
        doUpdate();
      });
    } else {
      if (!isBuyer) return res.cc("仅买家可操作", 403);
      doUpdate();
    }
  });

  function doUpdate() {
    let sql = `UPDATE orders SET status=?`;
    const params = [newStatus];
    if (timeField[newStatus]) sql += `, ${timeField[newStatus]}=NOW()`;
    sql += ` WHERE id=?`;
    params.push(order_id);

    db.query(sql, params, (err, results) => {
    if (err) return res.cc(err);
    if (results.affectedRows === 0) return res.cc("订单不存在", 404);

    // 支付成功时自动生成支付记录
    if (newStatus === "paid") {
      db.query("SELECT total_amount FROM orders WHERE id=?", [order_id], (errP, orderRows) => {
        if (!errP && orderRows.length > 0) {
          const payNo = "PAY" + Date.now() + String(Math.floor(Math.random() * 10000)).padStart(4, "0");
          db.query(
            "INSERT INTO payment_record (pay_no, order_id, user_id, amount, pay_method, status) VALUES (?, ?, ?, ?, 'balance', 'success')",
            [payNo, order_id, userId, orderRows[0].total_amount]
          );
        }
      });
    }

    // 取消订单时恢复库存
    if (newStatus === "cancelled") {
      const itemSql = "SELECT book_id, book_type, quantity FROM order_items WHERE order_id=?";
      db.query(itemSql, [order_id], (err2, items) => {
        if (!err2) {
          items.forEach((item) => {
            db.query(
              "UPDATE book_condition_price SET stock=stock+? WHERE book_id=? AND type COLLATE utf8mb4_unicode_ci = ?",
              [item.quantity, item.book_id, item.book_type]
            );
          });
        }
      });
    }

    // 完成订单时更新销量
    if (newStatus === "completed") {
      const itemSql = "SELECT book_id, book_type, quantity FROM order_items WHERE order_id=?";
      db.query(itemSql, [order_id], (err2, items) => {
        if (!err2) {
          items.forEach((item) => {
            if (item.book_type === "platform") {
              db.query("UPDATE platform_book SET sales_count=sales_count+? WHERE id=?", [item.quantity, item.book_id]);
            } else {
              db.query("UPDATE user_book SET nope=nope+? WHERE id=?", [item.quantity, item.book_id]);
            }
          });
        }
      });
    }

    res.send({ status: 200, message: "订单状态更新成功" });
  });
  }
};

// 获取各状态订单数量（全部=买+卖，我发布的，我买到的，我卖出的，以及各状态数量）
exports.getOrderCount = (req, res) => {
  const userId = req.auth.id;
  const sql = `
    SELECT 
      (SELECT COUNT(*) FROM orders WHERE user_id=?) AS my_bought,
      (SELECT COUNT(DISTINCT o.id) FROM orders o
        JOIN order_items oi ON oi.order_id = o.id AND oi.seller_id = ?) AS my_sold,
      (SELECT COUNT(*) FROM orders WHERE user_id=? AND status='pending') AS pending,
      (SELECT COUNT(*) FROM orders WHERE user_id=? AND status='paid') AS paid,
      (SELECT COUNT(*) FROM orders WHERE user_id=? AND status='shipped') AS shipped,
      (SELECT COUNT(*) FROM orders WHERE user_id=? AND status='completed') AS completed
  `;
  db.query(sql, [userId, userId, userId, userId, userId, userId], (err, results) => {
    if (err) return res.cc(err);
    const bought = results[0]?.my_bought || 0;
    const sold = results[0]?.my_sold || 0;
    const pending = results[0]?.pending || 0;
    const paid = results[0]?.paid || 0;
    const shipped = results[0]?.shipped || 0;
    const completed = results[0]?.completed || 0;
    db.query(
      "SELECT COUNT(*) AS c FROM user_book WHERE user_id=? UNION ALL SELECT COUNT(*) FROM platform_book WHERE user_id=?",
      [userId, userId],
      (err2, r2) => {
        if (err2) return res.cc(err2);
        const ub = (r2[0]?.c || 0);
        const pb = (r2[1]?.c || 0);
        const my_published = ub + pb;
        res.send({
          status: 200,
          message: "获取订单数量成功",
          data: { total: bought + sold, my_published, my_bought: bought, my_sold: sold, pending, paid, shipped, completed },
        });
      }
    );
  });
};
