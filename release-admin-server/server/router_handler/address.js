const db = require("../db/config");

// 获取地址列表
exports.getAddressList = (req, res) => {
  const userId = req.auth.id;
  const sql = "SELECT * FROM address WHERE user_id=? ORDER BY is_default DESC, created_at DESC";
  db.query(sql, [userId], (err, results) => {
    if (err) return res.cc(err);
    res.send({ status: 200, message: "获取地址列表成功", data: results });
  });
};

// 添加地址
exports.addAddress = (req, res) => {
  const userId = req.auth.id;
  const { name, phone, province, city, district, detail, is_default } = req.body;
  if (!name || !phone || !province || !city || !district || !detail) {
    return res.cc("请填写完整地址信息", 400);
  }

  // 如果设为默认，先取消其他默认
  const doInsert = () => {
    const sql = "INSERT INTO address SET ?";
    db.query(sql, { user_id: userId, name, phone, province, city, district, detail, is_default: is_default ? 1 : 0 }, (err2) => {
      if (err2) return res.cc(err2);
      res.send({ status: 200, message: "添加成功" });
    });
  };

  if (is_default) {
    db.query("UPDATE address SET is_default=0 WHERE user_id=?", [userId], () => doInsert());
  } else {
    doInsert();
  }
};

// 更新地址
exports.updateAddress = (req, res) => {
  const userId = req.auth.id;
  const { id, name, phone, province, city, district, detail, is_default } = req.body;
  if (!id) return res.cc("参数不完整", 400);

  const doUpdate = () => {
    const sql = "UPDATE address SET name=?, phone=?, province=?, city=?, district=?, detail=?, is_default=? WHERE id=? AND user_id=?";
    db.query(sql, [name, phone, province, city, district, detail, is_default ? 1 : 0, id, userId], (err2) => {
      if (err2) return res.cc(err2);
      res.send({ status: 200, message: "更新成功" });
    });
  };

  if (is_default) {
    db.query("UPDATE address SET is_default=0 WHERE user_id=?", [userId], () => doUpdate());
  } else {
    doUpdate();
  }
};

// 删除地址
exports.removeAddress = (req, res) => {
  const userId = req.auth.id;
  const { id } = req.body;
  if (!id) return res.cc("参数不完整", 400);
  db.query("DELETE FROM address WHERE id=? AND user_id=?", [id, userId], (err) => {
    if (err) return res.cc(err);
    res.send({ status: 200, message: "删除成功" });
  });
};

// 设为默认地址
exports.setDefaultAddress = (req, res) => {
  const userId = req.auth.id;
  const { id } = req.body;
  if (!id) return res.cc("参数不完整", 400);
  db.query("UPDATE address SET is_default=0 WHERE user_id=?", [userId], () => {
    db.query("UPDATE address SET is_default=1 WHERE id=? AND user_id=?", [id, userId], (err) => {
      if (err) return res.cc(err);
      res.send({ status: 200, message: "设置成功" });
    });
  });
};
