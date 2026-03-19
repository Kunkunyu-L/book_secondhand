// middleware/auth.js（权限校验中间件）
// 验证是否为可访问后台的角色，由 user 表的 role 字段决定
const ADMIN_ROLES = ["superAdmin", "operationAdmin", "customerService"];

const isAdmin = (req, res, next) => {
  if (req.auth && ADMIN_ROLES.includes(req.auth.role)) {
    next();
  } else {
    res.cc("无管理员权限", 403);
  }
};

module.exports = { isAdmin };
