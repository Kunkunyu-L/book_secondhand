const express = require("express");
const router = express.Router();
const orderHandler = require("../router_handler/order");

// 创建订单
router.post("/create", orderHandler.createOrder);

// 获取订单列表
router.get("/list", orderHandler.getOrderList);

// 获取订单详情
router.get("/detail", orderHandler.getOrderDetail);

// 更新订单状态（付款、取消等）
router.put("/status", orderHandler.updateOrderStatus);

// 获取订单数量统计
router.get("/count", orderHandler.getOrderCount);

module.exports = router;
