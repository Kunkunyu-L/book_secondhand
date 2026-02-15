const https = require("https");

// 与前端一致的腾讯地图 Key（仅用于服务端代理，避免浏览器 CORS）
const QQ_MAP_KEY = process.env.QQ_MAP_KEY || "E36BZ-DBRKQ-IZ25K-25WGD-CFUT3-V5BL7";

function request(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on("error", reject);
  });
}

// 获取省列表
exports.getList = async (req, res) => {
  try {
    const url = `https://apis.map.qq.com/ws/district/v1/list?key=${QQ_MAP_KEY}`;
    const data = await request(url);
    if (data.status === 0 && data.result && data.result[0]) {
      return res.send({ status: 200, data: data.result[0] });
    }
    return res.cc("获取省列表失败", 400);
  } catch (e) {
    return res.cc(e.message || "请求失败", 500);
  }
};

// 获取子级行政区（市/区）
exports.getChildren = async (req, res) => {
  const id = req.query.id;
  if (!id) return res.cc("缺少 id", 400);
  try {
    const url = `https://apis.map.qq.com/ws/district/v1/getchildren?id=${encodeURIComponent(id)}&key=${QQ_MAP_KEY}`;
    const data = await request(url);
    if (data.status === 0 && data.result && data.result[0]) {
      return res.send({ status: 200, data: data.result[0] });
    }
    return res.send({ status: 200, data: [] });
  } catch (e) {
    return res.cc(e.message || "请求失败", 500);
  }
};
