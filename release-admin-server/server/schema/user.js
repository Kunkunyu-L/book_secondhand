const Joi = require("joi");

// 定义校验规则
const regLoginSchema = Joi.object({
  username: Joi.string().alphanum().min(5).max(10).required().messages({
    "string.empty": "用户名不能为空",
    "string.alphanum": "用户名只能包含字母和数字",
    "string.min": "用户名至少 5 个字符",
    "string.max": "用户名最多 10 个字符",
    "any.required": "用户名是必填项",
  }),

  password: Joi.string()
    .pattern(/^\S{6,12}$/) // 非空白字符 6~12 位
    .required()
    .messages({
      "string.empty": "密码不能为空",
      "string.pattern.base": "密码必须是 6-12 位非空白字符",
      "any.required": "密码是必填项",
    }),

  // 后台登录可选：身份、验证码（不传则不做校验，兼容 UniApp 等）
  identity: Joi.string().valid("admin", "service").optional(),
  captchaToken: Joi.string().optional().allow(""),
  captchaValue: Joi.string().optional().allow(""),
});

const regRegisterSchema = Joi.object({
  username: Joi.string().alphanum().min(5).max(10).required().messages({
    "string.empty": "用户名不能为空",
    "string.alphanum": "用户名只能包含字母和数字",
    "string.min": "用户名至少 5 个字符",
    "string.max": "用户名最多 10 个字符",
    "any.required": "用户名是必填项",
  }),

  password: Joi.string()
    .pattern(/^\S{6,12}$/) // 非空白字符 6~12 位
    .required()
    .messages({
      "string.empty": "密码不能为空",
      "string.pattern.base": "密码必须是 6-12 位非空白字符",
      "any.required": "密码是必填项",
    }),

  phone: Joi.string()
    .pattern(/^1[3-9]\d{9}$/) // 中国大陆手机号
    .required()
    .messages({
      "string.empty": "手机号不能为空",
      "string.pattern.base": "手机号格式不正确，请输入 11 位中国大陆手机号",
      "any.required": "手机号是必填项",
    }),
});

module.exports = { regLoginSchema, regRegisterSchema };
