// middleware/auth.js（权限校验中间件）
// 验证是否为可登录后台的角色：超级管理员、运营管理员、客服（或 is_service=1）
const ADMIN_ROLES = ["superAdmin", "operationAdmin", "customerService"];

const isAdmin = (req, res, next) => {
  if (req.auth && (ADMIN_ROLES.includes(req.auth.role) || req.auth.is_service === 1)) {
    next();
  } else {
    res.cc("无管理员权限", 403);
  }
};

module.exports = { isAdmin };
