const express = require("express");
const router = express.Router();
const adminHandler = require("../router_handler/admin");
const contentHandler = require("../router_handler/admin_content");
const serviceHandler = require("../router_handler/admin_service");
const systemHandler = require("../router_handler/admin_system");
const { isAdmin } = require("../middlewar/auth");

// 所有管理路由需要管理员权限
router.use(isAdmin);

// ==================== 仪表盘 ====================
router.get("/dashboard", adminHandler.getDashboard);

// ==================== 用户管理 ====================
router.get("/users", adminHandler.getUsers);
router.put("/users/status", adminHandler.updateUserStatus);
router.put("/users/role", adminHandler.updateUserRole);
router.post("/users", adminHandler.addUser);

// ==================== 用户违规处理 ====================
router.get("/violations", adminHandler.getViolationList);
router.post("/violations", adminHandler.addViolation);

// ==================== 分类管理 ====================
router.get("/categories", adminHandler.getCategories);
router.post("/categories", adminHandler.addCategory);
router.put("/categories", adminHandler.updateCategory);
router.delete("/categories", adminHandler.deleteCategory);

// ==================== 平台图书管理 ====================
router.get("/books/platform", adminHandler.getPlatformBooks);
router.post("/books/platform", adminHandler.addPlatformBook);
router.put("/books/platform", adminHandler.updatePlatformBook);
router.delete("/books/platform", adminHandler.deletePlatformBook);

// ==================== 用户图书管理 ====================
router.get("/books/user", adminHandler.getUserBooks);
router.put("/books/user/status", adminHandler.updateUserBookStatus);

// ==================== 书籍审核 ====================
router.get("/books/audit", adminHandler.getBookAuditList);
router.put("/books/audit", adminHandler.auditBook);

// ==================== 订单管理 ====================
router.get("/orders", adminHandler.getOrders);
router.put("/orders/status", adminHandler.updateAdminOrderStatus);
router.get("/orders/detail", adminHandler.getOrderDetail);

// ==================== 退款/售后管理 ====================
router.get("/refunds", adminHandler.getRefundList);
router.put("/refunds/status", adminHandler.updateRefundStatus);

// ==================== 订单统计 ====================
router.get("/orders/stats", adminHandler.getOrderStats);

// ==================== 支付记录 ====================
router.get("/payments", adminHandler.getPaymentList);

// ==================== 提现管理 ====================
router.get("/withdrawals", adminHandler.getWithdrawalList);
router.put("/withdrawals/status", adminHandler.updateWithdrawalStatus);

// ==================== 优惠券管理 ====================
router.get("/coupons", adminHandler.getCouponList);
router.post("/coupons", adminHandler.addCoupon);
router.put("/coupons", adminHandler.updateCoupon);
router.delete("/coupons", adminHandler.deleteCoupon);

// ==================== 帖子管理 ====================
router.get("/discover/posts", adminHandler.getDiscoverPosts);
router.delete("/discover/posts", adminHandler.deleteDiscoverPost);
router.get("/discover/comments", adminHandler.getDiscoverComments);
router.delete("/discover/comments", adminHandler.deleteDiscoverComment);

// ==================== 内容管理 - 公告 ====================
router.get("/announcements", contentHandler.getAnnouncements);
router.post("/announcements", contentHandler.addAnnouncement);
router.put("/announcements", contentHandler.updateAnnouncement);
router.delete("/announcements", contentHandler.deleteAnnouncement);

// ==================== 内容管理 - 帮助文档 ====================
router.get("/help-articles", contentHandler.getHelpArticles);
router.post("/help-articles", contentHandler.addHelpArticle);
router.put("/help-articles", contentHandler.updateHelpArticle);
router.delete("/help-articles", contentHandler.deleteHelpArticle);

// ==================== 内容管理 - 轮播图 ====================
router.get("/banners", contentHandler.getBanners);
router.post("/banners", contentHandler.addBanner);
router.put("/banners", contentHandler.updateBanner);
router.delete("/banners", contentHandler.deleteBanner);

// ==================== 客服 - 人员管理 ====================
router.get("/service-staff", serviceHandler.getServiceStaff);
router.put("/service-staff", serviceHandler.updateServiceStaff);

// ==================== 客服 - 会话管理 ====================
router.get("/chat/sessions", serviceHandler.getChatSessions);
router.put("/chat/sessions/assign", serviceHandler.assignSession);
router.put("/chat/sessions/close", serviceHandler.closeSession);

// ==================== 客服 - 工单管理 ====================
router.get("/tickets", serviceHandler.getTickets);
router.put("/tickets", serviceHandler.updateTicket);

// ==================== 客服 - FAQ ====================
router.get("/faq/categories", serviceHandler.getFaqCategories);
router.post("/faq/categories", serviceHandler.saveFaqCategory);
router.delete("/faq/categories", serviceHandler.deleteFaqCategory);
router.get("/faq", serviceHandler.getFaqs);
router.post("/faq", serviceHandler.saveFaq);
router.delete("/faq", serviceHandler.deleteFaq);


// ==================== 客服 - 话术库 ====================
router.get("/quick-reply/categories", serviceHandler.getQuickReplyCategories);
router.post("/quick-reply/categories", serviceHandler.saveQuickReplyCategory);
router.delete("/quick-reply/categories", serviceHandler.deleteQuickReplyCategory);
router.get("/quick-reply", serviceHandler.getQuickReplies);
router.post("/quick-reply", serviceHandler.saveQuickReply);
router.delete("/quick-reply", serviceHandler.deleteQuickReply);

// ==================== 系统 - 基础配置 ====================
router.get("/configs", systemHandler.getConfigs);
router.put("/configs", systemHandler.saveConfigs);

// ==================== 系统 - 角色页面权限 ====================
router.get("/role-page-permission", systemHandler.getRolePagePermission);
router.put("/role-page-permission", systemHandler.saveRolePagePermission);

// ==================== 系统 - 通知模板 ====================
router.get("/notification-templates", systemHandler.getNotificationTemplates);
router.post("/notification-templates", systemHandler.saveNotificationTemplate);
router.delete("/notification-templates", systemHandler.deleteNotificationTemplate);

// ==================== 系统 - 站内通知 ====================
router.get("/notifications", systemHandler.getNotifications);
router.post("/notifications", systemHandler.sendNotification);
router.put("/notifications/read", systemHandler.markNotificationRead);
router.delete("/notifications", systemHandler.deleteNotification);

module.exports = router;
