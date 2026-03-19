# 📚 二手书交易平台

一个完整的二手书交易生态系统，包含前台小程序/H5、后台管理系统和后端服务。

![Vue 3](https://img.shields.io/badge/Vue-3.5.24-4FC08D?style=flat-square&logo=vue.js)
![Vite](https://img.shields.io/badge/Vite-7.2.4-646CFF?style=flat-square&logo=vite)
![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A518-339933?style=flat-square&logo=node.js)
![Element Plus](https://img.shields.io/badge/Element_Plus-2.9.1-409EFF?style=flat-square)
![UniApp](https://img.shields.io/badge/UniApp-Latest-007AFF?style=flat-square)
![MySQL](https://img.shields.io/badge/MySQL-5.5+-4479A1?style=flat-square&logo=mysql)

## ✨ 特性

### 🎯 前台应用 (UniApp)
- ✅ 首页展示：轮播图、公告、分类导航、精选图书
- ✅ 书市浏览：搜索、筛选、平台/用户图书混合展示
- ✅ 购物车：商品管理、优惠券使用
- ✅ 订单系统：下单、支付、物流、确认收货
- ✅ 个人中心：资料管理、地址簿、收藏、我的发布
- ✅ 社区发现：帖子发布、评论互动、点赞
- ✅ 客服系统：实时聊天、工单提交
- ✅ 交易服务：退款申请、优惠券、提现

### 🛠️ 后台管理系统 (Vue3 + Element Plus)
- ✅ **数据看板**：运营数据统计与可视化
- ✅ **书籍管理**：分类、平台图书、用户图书、审核
- ✅ **订单管理**：订单处理、退款售后、数据统计
- ✅ **用户管理**：用户列表、违规处理
- ✅ **交易管理**：支付记录、提现审核、优惠券
- ✅ **内容管理**：公告、轮播图、帮助中心、社区内容
- ✅ **客服管理**：会话监控、工单处理、话术库、FAQ
- ✅ **系统配置**：角色权限、全局设置、通知模板

### ⚙️ 后端服务 (Node.js + Express)
- ✅ RESTful API 接口
- ✅ JWT 身份认证
- ✅ Socket.IO 实时通信
- ✅ 文件上传处理
- ✅ 数据验证与过滤
- ✅ MySQL 数据库操作
- ✅ 工单通知系统

---

## 目录结构

```
book_secondhand/
├── server/                 # 后端服务 (Node.js + Express)
│   ├── router/            # 路由定义
│   ├── router_handler/    # 业务逻辑处理
│   ├── schema/            # 数据验证模式
│   ├── middlewar/         # 中间件
│   ├── db/                # 数据库配置
│   ├── utils/             # 工具函数
│   ├── socket.js          # Socket.IO 配置
│   └── index.js           # 入口文件
│
├── admin/                 # 后台管理系统 (Vue3 + Vite)
│   ├── src/
│   │   ├── api/          # API 封装
│   │   ├── components/   # 公共组件
│   │   ├── router/       # 路由配置
│   │   ├── stores/       # 状态管理 (Pinia)
│   │   ├── utils/        # 工具函数
│   │   └── views/        # 页面组件 (24 个管理页面)
│   ├── uno.config.ts     # UnoCSS 配置
│   └── vite.config.ts    # Vite 配置
│
├── uniapp/book_home/      # 前台应用 (UniApp)
│   ├── pages/            # 页面组件
│   ├── components/       # 自定义组件
│   ├── untils/           # 工具函数
│   ├── static/           # 静态资源
│   ├── App.vue           # 根组件
│   ├── main.js           # 入口文件
│   ├── manifest.json     # 应用配置
│   └── pages.json        # 页面配置
│
├── upload/                # 文件上传存储目录
│   ├── book_covers/      # 图书封面
│   ├── chat/             # 聊天记录
│   ├── order/            # 订单图片
│   └── user/             # 用户头像
│
├── secondhand.sql         # 完整数据库脚本（包含所有表结构）
├── db_schema.md           # 数据库结构说明文档（28 张表详解）
└── README.md              # 项目说明文档
```

---

## 🗄️ 数据库初始化

### 创建数据库

```sql
CREATE DATABASE IF NOT EXISTS book_secondhand DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_general_ci;
USE book_secondhand;
```

### 导入数据

执行完整数据库脚本：

```bash
mysql -u root -p book_secondhand < secondhand.sql
```

或在 MySQL 客户端中直接运行 `secondhand.sql` 文件内容。

### 数据库表概览

系统共包含 **28 张表**，覆盖以下模块：

- 👤 **用户体系**：user, address, user_violation
- 📚 **图书管理**：book_category, platform_book, user_book, book_condition_price, favorite
- 🛒 **订单交易**：orders, order_items, payment_record, refund, withdrawal, coupon, user_coupon
- 📢 **内容运营**：announcement, banner, help_article, discover_post*, faq*
- 💬 **客服系统**：chat_session, chat_message, service_ticket, quick_reply*, assigned_service
- ⚙️ **系统配置**：system_config, admin_role, book_audit, notification*, sys_user

详细表结构请查看 [数据库结构说明](db_schema.md)。

---

## 🚀 快速开始

### 后端服务 (server)

#### 1. 环境要求

- Node.js ≥ 18 (推荐 v20+)
- MySQL 5.7+ 或 8.x
- npm ≥ 9

#### 2. 安装依赖

```bash
cd server
npm install
```

#### 3. 配置数据库与 JWT

编辑 `server/config.js`：

- 数据库连接信息（host, port, user, password, database）
- JWT 密钥（jwtSecret）和过期时间（expiresIn）

#### 4. 启动服务

```bash
node index.js
```

服务启动在：`http://localhost:3000`

#### 主要能力

- 🔐 用户注册/登录（JWT 认证）
- 📖 图书、订单、购物车、地址、收藏、发布等业务接口
- 🛡️ 后台管理接口 `/admin/*`
- 📱 用户端扩展接口 `/client/*`（退款、工单、优惠券、通知等）
- 💬 实时聊天 Socket.IO `/socket.io`
- 📤 文件上传处理 `/upload/*`

---

### 后台管理前端 (admin)

详见 [admin/README.md](admin/README.md)

#### 1. 安装依赖

```bash
cd admin
npm install
```

#### 2. 开发模式

```bash
npm run dev
```

访问：`http://localhost:5175`

> ⚠️ 需要后端服务已启动在 3000 端口

#### 3. 生产构建

```bash
npm run build
```

构建产物输出到 `admin/dist/` 目录。

---

### 前台 UniApp (uniapp/book_home)

#### 1. 环境要求

- HBuilderX（推荐）或 UniApp CLI
- 微信开发者工具（如运行小程序）

#### 2. 运行步骤（HBuilderX）

1. 打开 HBuilderX，导入 `uniapp/book_home` 目录
2. 修改接口地址配置：

   打开 `uniapp/book_home/untils/config.js`：
   ```js
   // 开发环境（本地调试）
   export const baseURL = 'http://localhost:3000'
   
   // 真机调试（改为你的电脑局域网 IP）
   export const baseURL = 'http://192.168.1.100:3000'
   ```

3. 选择运行目标：
   - H5：浏览器打开
   - 微信小程序：微信开发者工具
   - App：真机或模拟器

#### 主要功能

- 🏠 首页：分类、平台图书、用户图书、轮播图、公告
- 📚 书市：搜索、筛选、图书详情
- 🛒 购物车 & 下单：商品管理、订单确认
- 📋 订单中心：订单列表、详情、确认收货
- 👤 个人中心：资料、地址、收藏、我的发布
- 💰 交易服务：优惠券、退款申请
- 💬 客服聊天：会话列表、实时对话
- 📖 帮助中心：常见问题、工单提交

---

## ❓ 常见问题

### 🔌 真机请求不到接口？

**解决方案：**
1. 确认后端服务已启动且防火墙放行 3000 端口
2. 在 `uniapp/book_home/untils/config.js` 中将 `baseURL` 改为电脑局域网 IP
3. 确保手机和电脑在同一局域网内

### 🔐 后台登录不上？

**排查步骤：**
1. 检查数据库中是否有管理员账号
2. 确认密码加密方式与后端一致（bcrypt）
3. 查看后端控制台是否有 Joi 校验错误或 JWT 错误
4. 检查浏览器 Network 面板中的请求响应

### 💬 Socket 聊天连不上？

**解决方法：**
1. 确保后端 `server/index.js` 中 Socket.IO 已正常启动
2. 检查前后端 Socket.IO 客户端版本是否兼容
3. H5 环境下查看浏览器控制台与 Network 中 `/socket.io` 请求状态
4. 小程序环境需使用 WebSocket 协议（wss://）

### 📦 依赖安装失败？

**尝试以下方法：**
```bash
# 清理缓存后重新安装
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# 如仍失败，可尝试使用淘宝镜像
npm config set registry https://registry.npmmirror.com
npm install
```

### 🗄️ 数据库连接失败？

**检查清单：**
- [ ] MySQL 服务是否启动
- [ ] 数据库用户名密码是否正确
- [ ] 数据库 `book_secondhand` 是否已创建
- [ ] `server/config.js` 中的数据库配置是否正确

---

## 📊 技术架构

### 前端技术栈

| 模块 | 技术选型 | 版本 |
|------|---------|------|
| 后台框架 | Vue 3 + TypeScript | 3.5.24 |
| 构建工具 | Vite | 7.2.4 |
| UI 组件库 | Element Plus | 2.9.1 |
| 状态管理 | Pinia | 2.3.0 |
| 路由 | Vue Router | 4.5.0 |
| CSS 框架 | UnoCSS | 0.63.0 |
| HTTP 客户端 | Axios | 1.7.9 |
| 实时通信 | Socket.IO Client | 4.8.3 |
| 前台框架 | UniApp | Latest |
| 前台 UI | uView UI | 2.0.38 |

### 后端技术栈

| 组件 | 技术选型 | 版本 |
|------|---------|------|
| 框架 | Express | 5.1.0 |
| 语言 | Node.js | ≥18 |
| 数据库 | MySQL | 5.5+ |
| 认证 | JWT (jsonwebtoken) | 9.0.2 |
| 加密 | bcryptjs | 3.0.3 |
| 验证 | Joi | 18.0.1 |
| 实时通信 | Socket.IO | 4.8.3 |
| 文件上传 | Multer | 2.1.1 |
| CORS | cors | 2.8.5 |
| 环境变量 | dotenv | 17.3.1 |
| HTTP 请求 | axios | 1.7.0 |
| 表单数据 | form-data | 4.0.0 |

---

## 📝 特别说明

- ✅ 本项目已移除「投诉举报」功能，以当前代码和数据库脚本为准
- 📖 详细数据库结构请查看 [db_schema.md](db_schema.md)
- 🔧 新增模块时建议同步更新本文档
- 🌐 生产环境部署需配置正确的域名和 HTTPS 证书
- 🔒 敏感信息（数据库密码、JWT 密钥等）请使用环境变量管理

---

## 📄 许可证

本项目仅供学习交流使用。

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

---

## 📮 联系方式

如有问题，请通过以下方式联系：

- 📧 Email: 请在系统设置中查看
- 💬 工单系统：平台内置客服工单

---

**祝使用愉快！** 🎉

