const mysql = require("mysql");

const poolConfig = {
  host: "59.110.64.215",
  user: "secondhand",
  password: "564644056Ln",
  database: "secondhand",
  connectionLimit: 10,
  queueLimit: 0,
  waitForConnections: true,
};

const pool = mysql.createPool(poolConfig);

// 兼容原有 db.query 用法：对外暴露一个具有 query 方法的对象，内部从 pool 取连接执行
// 避免 "Cannot enqueue Query after fatal error"：连接断开后 pool 会自动重连，无需单连接重连逻辑
const db = {
  query(sql, params, callback) {
    if (typeof params === "function") {
      callback = params;
      params = [];
    }
    pool.getConnection((err, conn) => {
      if (err) {
        if (callback) return callback(err);
        return;
      }
      conn.query(sql, params, (qerr, results, fields) => {
        conn.release();
        if (callback) callback(qerr, results, fields);
      });
    });
  },
};

// 供需要 pool 的地方使用（如后续扩展）
db.pool = pool;

module.exports = db;
