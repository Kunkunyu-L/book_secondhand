const express = require("express");
const router = express.Router();
const cartHandler = require("../router_handler/cart");

// 获取购物车列表
router.get("/list", cartHandler.getCartList);

// 添加到购物车
router.post("/add", cartHandler.addToCart);

// 更新购物车数量
router.put("/update", cartHandler.updateCartItem);

// 删除购物车项
router.delete("/remove", cartHandler.removeCartItem);

// 更新选中状态
router.put("/select", cartHandler.updateSelected);

// 全选/取消全选
router.put("/selectAll", cartHandler.selectAll);

module.exports = router;
