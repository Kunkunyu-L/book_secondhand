const mysql = require("mysql");

const db = mysql.createConnection({
  host: "59.110.64.215",
  user: "secondhand",
  password: "564644056Ln",
  database: "secondhand",
});

module.exports = db;
