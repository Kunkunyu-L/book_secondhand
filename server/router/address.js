const express = require("express");
const router = express.Router();
const addressHandler = require("../router_handler/address");

// 获取地址列表
router.get("/list", addressHandler.getAddressList);

// 添加地址
router.post("/add", addressHandler.addAddress);

// 更新地址
router.put("/update", addressHandler.updateAddress);

// 删除地址
router.delete("/remove", addressHandler.removeAddress);

// 设为默认地址
router.put("/setDefault", addressHandler.setDefaultAddress);

module.exports = router;
