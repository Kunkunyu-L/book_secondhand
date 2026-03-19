const express = require("express");
const router = express.Router();

const homeHandler = require("../router_handler/home");

// 系统配置（公开，与后台基础设置同源）
router.get("/config", homeHandler.getSystemConfig);

//获取一级分类（兼容两种路径）
router.get("/categories", homeHandler.getLevel1Categories);
router.get("/categories/level1", homeHandler.getLevel1Categories);

//平台售卖图书信息
router.get("/books/platform", homeHandler.getBookPlatformInfo);

//用户售卖图书的信息
router.get("/books/userbook", homeHandler.getBookUserInfo);

//书市内容，混合显示，随机排序
router.get("/books/market", homeHandler.getBookMarketInfo);

//商品详情页查询
router.post("/books/detail", homeHandler.getBookDetailInfo);

//搜索图书
router.get("/books/search", homeHandler.searchBooks);

// ======= 公开内容接口（与后台管理对应） =======
//轮播图
router.get("/banners", homeHandler.getBanners);
//公告列表
router.get("/announcements", homeHandler.getAnnouncements);
//公告详情
router.get("/announcements/detail", homeHandler.getAnnouncementDetail);
//帮助文章列表
router.get("/help-articles", homeHandler.getHelpArticles);
//帮助文章详情
router.get("/help-articles/detail", homeHandler.getHelpArticleDetail);
//FAQ列表
router.get("/faq", homeHandler.getFaqs);
//可领取优惠券
router.get("/coupons", homeHandler.getAvailableCoupons);

module.exports = router;
