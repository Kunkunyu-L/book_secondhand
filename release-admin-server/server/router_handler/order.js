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

// 获取订单列表
exports.getOrderList = (req, res) => {
  const userId = req.auth.id;
  const { status } = req.query; // 可选筛选
  let sql = `
    SELECT o.*, 
      (SELECT JSON_ARRAYAGG(
        JSON_OBJECT('title', oi.title, 'cover_img', oi.cover_img, 'price', oi.price, 'quantity', oi.quantity, 'book_id', oi.book_id, 'book_type', oi.book_type)
      ) FROM order_items oi WHERE oi.order_id = o.id) AS items
    FROM orders o WHERE o.user_id = ?
  `;
  const params = [userId];
  if (status && status !== "all") {
    sql += " AND o.status = ?";
    params.push(status);
  }
  sql += " ORDER BY o.created_at DESC";

  db.query(sql, params, (err, results) => {
    if (err) return res.cc(err);
    // 解析items JSON
    results.forEach((r) => {
      if (typeof r.items === "string") {
        try { r.items = JSON.parse(r.items); } catch (e) { r.items = []; }
      }
      if (!r.items) r.items = [];
    });
    res.send({ status: 200, message: "获取订单列表成功", data: results });
  });
};

// 获取订单详情
exports.getOrderDetail = (req, res) => {
  const userId = req.auth.id;
  const { order_id } = req.query;
  if (!order_id) return res.cc("缺少参数", 400);

  const sql = "SELECT * FROM orders WHERE id=? AND user_id=?";
  db.query(sql, [order_id, userId], (err, orderResults) => {
    if (err) return res.cc(err);
    if (orderResults.length === 0) return res.cc("订单不存在", 404);

    const order = orderResults[0];
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

// 更新订单状态
exports.updateOrderStatus = (req, res) => {
  const userId = req.auth.id;
  const { order_id, status: newStatus } = req.body;
  const validStatus = ["paid", "shipped", "completed", "cancelled"];
  if (!order_id || !validStatus.includes(newStatus)) return res.cc("参数错误", 400);

  // 状态时间字段映射
  const timeField = {
    paid: "pay_time",
    shipped: "ship_time",
    completed: "receive_time",
  };

  let sql = `UPDATE orders SET status=?`;
  const params = [newStatus];
  if (timeField[newStatus]) {
    sql += `, ${timeField[newStatus]}=NOW()`;
  }
  sql += ` WHERE id=? AND user_id=?`;
  params.push(order_id, userId);

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
};

// 获取各状态订单数量
exports.getOrderCount = (req, res) => {
  const userId = req.auth.id;
  const sql = `
    SELECT 
      COUNT(*) AS total,
      SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) AS pending,
      SUM(CASE WHEN status='paid' THEN 1 ELSE 0 END) AS paid,
      SUM(CASE WHEN status='shipped' THEN 1 ELSE 0 END) AS shipped,
      SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) AS completed
    FROM orders WHERE user_id=?
  `;
  db.query(sql, [userId], (err, results) => {
    if (err) return res.cc(err);
    res.send({ status: 200, message: "获取订单数量成功", data: results[0] });
  });
};
