// middleware/auth.js（权限校验中间件）
// 验证是否为管理员角色
const isAdmin = (req, res, next) => {
  // req.auth 是 express-jwt v8+ 解析后的数据（包含 token 中的 payload）
  if (req.auth && req.auth.role === "admin") {
    // 是管理员，放行
    next();
  } else {
    // 非管理员，返回无权限
    res.cc("无管理员权限", 403);
  }
};

module.exports = { isAdmin };
