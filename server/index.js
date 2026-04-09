const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);

// Socket.IO
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});
const { initSocket } = require("./socket");
initSocket(io);
// 把 io 挂到 app 上供路由使用
app.set("io", io);

// 添加 JSON 解析中间件（支持接收 JSON 格式参数）
app.use(express.json());
// 保留表单解析中间件（支持 x-www-form-urlencoded 格式）
app.use(express.urlencoded({ extended: true }));

const cors = require("cors");
const path = require("path");
app.use(cors());

// 静态托管上传文件（公开访问，需在 jwtAuth 之前）
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(express.urlencoded({ extended: false }));
app.use((req, res, next) => {
  res.cc = (err, status = 500) => {
    return res.send({
      status,
      message: err instanceof Error ? err.message : err,
    });
  };
  next();
});

// 引入 JWT 验证模块
const { jwtAuth, jwtErrorHandler } = require("./middlewar/jwtAuth");
// 注册 JWT 验证中间件（先验证 token）
app.use(jwtAuth);

//用户路由（公开）
const userRouter = require("./router/user");
app.use("/api", userRouter);
//获取用户信息的路由（需认证）
const userInfoRouter = require("./router/userinfo");
app.use("/my", userInfoRouter);
//获取首页信息路由（公开）
const homeRouter = require("./router/home");
app.use("/home", homeRouter);
//订单路由（需认证）
const orderRouter = require("./router/order");
app.use("/order", orderRouter);
//地址路由（需认证）
const addressRouter = require("./router/address");
app.use("/address", addressRouter);
//收藏路由（需认证）
const favoriteRouter = require("./router/favorite");
app.use("/favorite", favoriteRouter);
//发布图书路由（需认证）
const publishRouter = require("./router/publish");
app.use("/publish", publishRouter);
//聊天REST路由（需认证）
const chatRouter = require("./router/chat");
app.use("/chat", chatRouter);
//用户端功能路由（需认证：退款、投诉、工单、优惠券、通知）
const clientRouter = require("./router/client");
app.use("/client", clientRouter);
//发现（帖子：列表/评论公开，发帖/点赞/评论需认证）
const discoverRouter = require("./router/discover");
app.use("/discover", discoverRouter);
// 图片上传（需认证）
const uploadRouter = require("./router/upload");
app.use("/upload", uploadRouter);
//管理后台路由（需认证+管理员权限）
const adminRouter = require("./router/admin");
app.use("/admin", adminRouter);

// 注册 JWT 错误处理中间件（放在路由之后，捕获验证错误）
app.use(jwtErrorHandler);

//测试服务器是否正常运行
app.get("/", (req, res) => {
  res.send("Hello World");
});

server.listen(3000, () => {
  console.log("Server listening on port 3000 (HTTP + WebSocket)");
});
