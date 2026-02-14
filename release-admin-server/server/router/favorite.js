const express = require("express");
const router = express.Router();
const favoriteHandler = require("../router_handler/favorite");

// 获取收藏列表
router.get("/list", favoriteHandler.getFavoriteList);

// 添加收藏
router.post("/add", favoriteHandler.addFavorite);

// 取消收藏
router.delete("/remove", favoriteHandler.removeFavorite);

// 检查是否已收藏
router.get("/check", favoriteHandler.checkFavorite);

module.exports = router;
