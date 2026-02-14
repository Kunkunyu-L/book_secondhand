const express = require("express");
const router = express.Router();

const userHandler = require("../router_handler/userinfo");

//获取用户信息
router.get("/getUserInfo", userHandler.getUserInfo);

//更新用户资料
router.put("/updateProfile", userHandler.updateProfile);

//修改密码
router.put("/updatePassword", userHandler.updatePassword);

//登出
router.post("/logout", userHandler.logout);

module.exports = router;
