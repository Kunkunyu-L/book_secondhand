// middleware/jwtAuth.js
const { expressjwt: expressJWT } = require("express-jwt");
const config = require("../config");

// 1. 生成 JWT 验证中间件
const jwtAuth = expressJWT({
  secret: config.jwtSecreKey, // 密钥（与生成 token 时一致）
  algorithms: ["HS256"], // 加密算法（必须指定，否则可能报错）
}).unless((req) => {
  if (/^\/api\/.*/.test(req.path)) return true;
  if (/^\/home\/.*/.test(req.path)) return true;
  // 发现：帖子列表、某帖评论列表 公开；/discover/my-posts 需认证
  if (req.method === "GET" && req.path === "/discover/posts") return true;
  if (req.method === "GET" && /^\/discover\/posts\/\d+\/comments$/.test(req.path)) return true;
  return false;
});

// 2. 生成 JWT 错误处理中间件
const jwtErrorHandler = (err, req, res, next) => {
  // 非 JWT 错误，直接交给下一个错误处理中间件
  if (err.name !== "UnauthorizedError") {
    return next(err);
  }

  // JWT 验证失败的具体处理
  switch (err.message) {
    case "No authorization token was found":
      res.cc("验证失败：未提供 token", 401);
      break;
    case "invalid signature":
      res.cc("验证失败：无效的 token", 401);
      break;
    case "jwt expired":
      res.cc("验证失败：token 已过期", 401);
      break;
    default:
      res.cc("验证失败：token 验证异常", 401);
  }
};

// 导出两个中间件
module.exports = {
  jwtAuth,
  jwtErrorHandler,
};
