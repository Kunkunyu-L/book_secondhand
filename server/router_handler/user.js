const db = require("../db/config");
const bcrypt = require("bcryptjs");
const config = require("../config");
const jwt = require("jsonwebtoken");
const { generate: genCaptcha, verify: verifyCaptcha } = require("../utils/captcha");

// 获取验证码
exports.getCaptcha = (req, res) => {
  const { token, question } = genCaptcha();
  res.send({ status: 200, data: { token, question } });
};

//注册处理的函数
exports.register = (req, res) => {
  const userinfo = req.body;

  // 验证码校验
  if (!verifyCaptcha(userinfo.captchaToken, userinfo.captchaValue)) {
    return res.cc("验证码错误或已过期", 400);
  }

  const sqlCheck = `select * from user where username=?`;

  db.query(sqlCheck, [userinfo.username], (err, results) => {
    if (err) return res.cc(err);
    if (results.length !== 0)
      return res.cc("用户名被占用，请更换其他用户名！", 400);

    userinfo.password = bcrypt.hashSync(userinfo.password, 10);

    const sql = `insert into user set ?`;
    const arr = {
      username: userinfo.username,
      password: userinfo.password,
      phone: userinfo.phone,
    };
    db.query(sql, arr, (err, results) => {
      if (err) return res.cc(err);
      if (results.affectedRows !== 1)
        return res.cc("注册用户失败，请稍后再试！", 400);
      res.cc("注册成功！", 200);
    });
  });
};

// 登录处理的函数（uniapp/admin 公用，不限角色；admin 面板由前端 auth.ts 二次校验 role）
exports.login = (req, res) => {
  const userinfo = req.body;

  // 验证码校验（若传入则必须正确）
  if (userinfo.captchaToken) {
    if (!verifyCaptcha(userinfo.captchaToken, userinfo.captchaValue)) {
      return res.cc("验证码错误或已过期", 400);
    }
  }

  const sql = "select * from user where username=?";
  db.query(sql, userinfo.username, (err, results) => {
    if (err) return res.cc(err);
    if (results.length !== 1) return res.cc("登录失败，没有找到此用户！", 400);

    const compareResult = bcrypt.compareSync(
      userinfo.password,
      results[0].password
    );
    if (!compareResult) return res.cc("登录失败，密码错误！", 400);

    const row = results[0];
    const user = {
      id: row.id,
      username: row.username,
      role: row.role,
    };
    const tokenStr = jwt.sign(user, config.jwtSecreKey, {
      expiresIn: config.expiresIn,
    });
    res.send({
      status: 200,
      message: "登录成功！",
      token: "Bearer " + tokenStr,
    });
  });
};
