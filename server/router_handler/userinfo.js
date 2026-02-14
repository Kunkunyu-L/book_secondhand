const db = require("../db/config");
const bcrypt = require("bcryptjs");

const tokenBlacklist = new Set();

exports.getUserInfo = (req, res) => {
  const sql = "select * from user where username=?";
  db.query(sql, req.auth.username, (err, results) => {
    if (err) return res.cc(err);
    if (results.length !== 1) return res.cc("获取用户信息失败！");
    const user = { ...results[0], password: "" };
    res.send({
      status: 200,
      message: "获取用户信息成功！",
      data: user,
    });
  });
};

// 更新用户资料
exports.updateProfile = (req, res) => {
  const userId = req.auth.id;
  const { nickname, avatar, phone } = req.body;
  const fields = [];
  const values = [];
  if (nickname !== undefined) { fields.push("nickname=?"); values.push(nickname); }
  if (avatar !== undefined) { fields.push("avatar=?"); values.push(avatar); }
  if (phone !== undefined) { fields.push("phone=?"); values.push(phone); }
  if (fields.length === 0) return res.cc("没有需要更新的字段", 400);

  values.push(userId);
  const sql = `UPDATE user SET ${fields.join(",")} WHERE id=?`;
  db.query(sql, values, (err, results) => {
    if (err) return res.cc(err);
    res.send({ status: 200, message: "更新成功" });
  });
};

// 修改密码
exports.updatePassword = (req, res) => {
  const userId = req.auth.id;
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) return res.cc("参数不完整", 400);

  db.query("SELECT password FROM user WHERE id=?", [userId], (err, results) => {
    if (err) return res.cc(err);
    if (results.length === 0) return res.cc("用户不存在", 404);
    if (!bcrypt.compareSync(oldPassword, results[0].password)) {
      return res.cc("原密码错误", 400);
    }
    const hashedPwd = bcrypt.hashSync(newPassword, 10);
    db.query("UPDATE user SET password=? WHERE id=?", [hashedPwd, userId], (err2) => {
      if (err2) return res.cc(err2);
      res.send({ status: 200, message: "密码修改成功" });
    });
  });
};

exports.logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split("Bearer ")[1];
    if (token) {
      tokenBlacklist.add(token);
    }
    res.send({ status: 200, message: "退出登录成功" });
  } catch (err) {
    res.cc("退出登录失败", 500);
  }
};
exports.getBlacklist = () => tokenBlacklist;
