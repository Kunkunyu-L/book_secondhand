## 项目简介

二手书交易平台，包含：

- **前台 UniApp 小程序/H5**：用户浏览图书、下单、聊天、售后等。
- **后台管理系统（Vue3 + Element Plus）**：运营方进行书籍、订单、用户、客服、内容、系统配置等管理。
- **后端服务（Node.js + Express + MySQL）**：提供统一接口、认证、实时聊天、通知等能力。

> 本项目已经对「投诉举报」功能做了删除处理，请以当前代码和数据库脚本为准。

---

## 目录结构

- `server/`：Node.js + Express 后端服务
- `admin/`：后台管理前端（Vite + Vue3 + Element Plus）
- `uniapp/`：UniApp 前台（H5 / 小程序）
- `database_update.sql`：最初版本数据库建表与变更脚本
- `database_update_v2.sql`：第二版数据库变更脚本
- `database_update_v3.sql`：最新数据库变更脚本（客服、内容、系统设置等）
- `数据库结构说明.md`：数据库结构说明

---

## 数据库初始化与升级

1. 创建数据库（例如）：

```sql
CREATE DATABASE IF NOT EXISTS book_secondhand DEFAULT CHARSET utf8mb4;
USE book_secondhand;
```

2. 依次执行 SQL 脚本（推荐顺序）：

```text
database_update.sql
database_update_v2.sql
database_update_v3.sql
```

> 如果已经有部分表存在，可以忽略 `IF NOT EXISTS` 之外的重复建表错误；如需调整字段，请以 `database_update_v3.sql` 为主。

---

## 后端服务（server）

### 环境要求

- Node.js ≥ 16
- MySQL 5.7+ 或 8.x

### 安装依赖

```bash
cd server
npm install
```

### 配置数据库与 JWT

检查/修改 `server/db/config.js`、`server/config.js`（如果存在），确保：

- 数据库连接信息正确（host、port、user、password、database）。
- JWT 密钥、过期时间等配置合理。

### 启动后端

```bash
cd server
node index.js
```

默认端口：`http://localhost:3000`  
主要能力：

- 用户注册/登录（JWT）
- 图书、订单、购物车、地址、收藏、发布等业务接口
- 后台管理接口 `/admin/*`
- 用户端扩展接口 `/client/*`（退款、工单、优惠券、通知等）
- 实时聊天 Socket.IO `/socket.io`

---

## 后台管理前端（admin）

### 环境要求

- Node.js ≥ 16
- npm / pnpm / yarn 任一

### 安装依赖

```bash
cd admin
npm install
```

### 开发环境运行

```bash
cd admin
npm run dev
```

默认地址：`http://localhost:5173`（以终端输出为准），需后端 `http://localhost:3000` 已启动。

### 构建生产包

```bash
cd admin
npx vite build
```

构建产物输出到 `admin/dist/` 目录。

后台主要模块：

- 仪表盘
- 书籍管理（分类、平台图书、用户图书、书籍审核）
- 订单管理（订单列表、退款/售后、订单统计）
- 用户管理（用户列表、违规处理）
- 交易管理（支付记录、提现管理、优惠券管理）
- 内容管理（公告、帮助中心、轮播图）
- 客服管理（在线咨询、工单、常见问题库、客服人员、话术库）
- 系统设置（角色权限、基础设置、消息通知配置）

---

## 前台 UniApp（uniapp/book_home）

### 环境要求

- HBuilderX 或 CLI 版 uni-app 开发环境

### 运行步骤（HBuilderX 建议）

1. 打开 HBuilderX，导入 `uniapp/book_home` 目录。
2. 根据实际情况修改接口地址：

   打开 `uniapp/book_home/untils/config.js`，将：

   ```js
   export const baseURL = 'http://localhost:3000'
   ```

   在真机调试时改为电脑局域网 IP，例如：

   ```js
   export const baseURL = 'http://192.168.1.100:3000'
   ```

3. 选择运行到 H5 / 小程序 / App 等目标平台。

前台主要功能：

- 首页：分类、平台图书、用户图书、轮播图、公告
- 书市：图书搜索、分类筛选、平台/用户图书混合展示
- 购物车、下单、订单列表与详情、确认收货
- 用户中心：个人资料、收货地址、收藏、我发布的图书
- 交易相关：我的优惠券、申请退款
- 消息/客服：聊天会话列表、与卖家/平台客服实时聊天
- 帮助与内容：帮助中心、常见问题、平台公告、工单提交

---

## 常见问题（FAQ 简要）

- **真机请求不到接口？**
  - 确认后端 `server` 已在电脑上运行且防火墙放行端口 3000。
  - 在 `untils/config.js` 中把 `baseURL` 改为电脑局域网 IP，而不是 `localhost`。

- **后台登录不上？**
  - 确认数据库中是否有管理员账号，密码加密方式与后端一致（bcrypt）。
  - 查看后端控制台是否有 Joi 校验错误或 JWT 错误。

- **Socket 聊天连不上？**
  - 确保后端 `server/index.js` 中 Socket.IO 已正常启动且端口与前台配置一致。
  - H5 环境下注意浏览器控制台与 Network 中 `/socket.io` 请求状态。

---

## 说明

- 本 README 只做运行与结构说明，具体表结构请查看 `数据库结构说明.md` 与 `database_update_v3.sql`。
- 若后续再新增模块（例如新业务表或新页面），建议同步更新此文件，简要写明：
  - 新增的数据库脚本
  - 新增的路由/页面入口
  - 需要特别注意的配置（如第三方接口、密钥等）

