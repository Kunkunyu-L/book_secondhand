const express = require("express");
const router = express.Router();

//导入用户处理函数对应的模块
const userHandler = require("../router_handler/user");

//验证数据函数
const { regLoginSchema, regRegisterSchema } = require("../schema/user");
// 手动实现校验中间件
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      console.log(error);
      res.cc(error.details[0].message, 400);
      return;
      //   return res.status(400).json({ message: error.details[0].message });
    }
    next();
  };
};

//注册新用户
router.post("/register", validate(regRegisterSchema), userHandler.register);

// 获取登录验证码（数学算式）
router.get("/captcha", userHandler.getCaptcha);

//登录
router.post("/login", validate(regLoginSchema), userHandler.login);

module.exports = router;
