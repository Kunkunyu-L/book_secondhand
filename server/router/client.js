const express = require("express");
const router = express.Router();
const clientHandler = require("../router_handler/client");

// 所有接口需登录认证（由 JWT 中间件保证）

// ========= 退款 =========
router.post("/refund", clientHandler.applyRefund);
router.get("/refunds", clientHandler.getMyRefunds);

// ========= 咨询工单 =========
router.post("/ticket", clientHandler.createTicket);
router.get("/tickets", clientHandler.getMyTickets);
router.get("/ticket/detail", clientHandler.getTicketDetail);

// ========= 优惠券 =========
router.post("/coupon/claim", clientHandler.claimCoupon);
router.get("/coupons", clientHandler.getMyCoupons);

// ========= 通知 =========
router.get("/notifications", clientHandler.getMyNotifications);
router.put("/notifications/read", clientHandler.markNotificationRead);
router.get("/notifications/unread-count", clientHandler.getUnreadCount);

module.exports = router;
