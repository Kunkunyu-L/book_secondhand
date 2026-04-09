# 二手书交易平台 - 后台管理系统

基于 Vue 3 + TypeScript + Vite + Element Plus 构建的运营后台管理系统。

## 技术栈

- **框架**: Vue 3.5.24
- **构建工具**: Vite 7.2.4
- **语言**: TypeScript 5.9.3
- **UI 组件库**: Element Plus 2.9.1
- **状态管理**: Pinia 2.3.0
- **路由**: Vue Router 4.5.0
- **HTTP 客户端**: Axios 1.7.9
- **实时通信**: Socket.IO Client 4.8.3
- **CSS 框架**: UnoCSS 0.63.0
- **图标**: @element-plus/icons-vue 2.3.1

## 功能模块

### 核心管理功能

- **仪表盘** (`Dashboard.vue`): 平台数据统计与概览
- **登录系统** (`Login.vue`): 管理员身份认证

### 书籍管理

- **分类管理** (`CategoryManage.vue`): 图书分类配置
- **平台图书管理** (`PlatformBookManage.vue`): 平台自营图书管理
- **用户图书管理** (`UserBookManage.vue`): 用户发布的二手书管理
- **书籍审核** (`BookAudit.vue`): 图书上架审核

### 订单管理

- **订单管理** (`OrderManage.vue`): 订单列表、详情处理
- **退款管理** (`RefundManage.vue`): 退款/售后申请处理
- **订单统计** (`OrderStats.vue`): 订单数据统计分析
- **支付记录** (`PaymentRecord.vue`): 支付流水查询

### 用户管理

- **用户管理** (`UserManage.vue`): 用户列表、详情、状态管理
- **违规管理** (`ViolationManage.vue`): 用户违规记录处理

### 交易管理

- **优惠券管理** (`CouponManage.vue`): 优惠券配置与发放
- **提现管理** (`WithdrawalManage.vue`): 用户提现申请审核

### 内容管理

- **公告管理** (`AnnouncementManage.vue`): 平台公告发布
- **轮播图管理** (`BannerManage.vue`): 首页轮播图配置
- **发现页管理** (`DiscoverPostManage.vue`): 社区帖子管理
- **发现页评论** (`DiscoverPostComments.vue`): 社区评论管理
- **FAQ 管理** (`FaqManage.vue`): 常见问题配置

### 客服管理

- **会话管理** (`ChatSessionManage.vue`): 在线咨询会话管理
- **工单管理** (`TicketManage.vue`): 客服工单处理

### 系统设置

- **角色权限** (`RolePageManage.vue`): 管理员角色与权限配置
- **全局设置** (`SystemConfig.vue`): 平台基础配置

## 开发指南

### 环境要求

- Node.js ≥ 18 (推荐 v20+)
- npm ≥ 9

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

启动后访问：http://localhost:5175

> 注意：开发模式下会自动代理 API 请求到后端服务 (http://localhost:3000)，请确保后端服务已启动。

### 生产构建

```bash
npm run build
```

构建产物输出到 `dist/` 目录。

### 预览生产包

```bash
npm run preview
```

## 项目结构

```
admin/
├── src/
│   ├── api/              # API 接口封装
│   ├── assets/           # 静态资源
│   ├── components/       # 公共组件
│   ├── router/          # 路由配置
│   ├── stores/          # Pinia 状态管理
│   ├── utils/           # 工具函数
│   ├── views/           # 页面组件
│   ├── App.vue          # 根组件
│   └── main.ts          # 入口文件
├── index.html
├── package.json
├── uno.config.ts        # UnoCSS 配置
├── tsconfig.json        # TypeScript 配置
└── vite.config.ts       # Vite 配置
```

## 环境变量配置

项目使用以下环境变量文件：

- `.env.development`: 开发环境配置
- `.env.production`: 生产环境配置

主要变量：

- `VITE_API_BASE_URL`: 后端 API 基础地址
- `VITE_UPLOAD_BASE_URL`: 文件上传地址

## API 代理配置

在 `vite.config.ts` 中配置了以下代理：

- `/api` → 业务接口
- `/admin` → 后台管理接口
- `/home` → 前台接口
- `/chat` → 聊天接口
- `/upload` / `/uploads` → 文件上传
- `/socket.io` → WebSocket 连接

所有请求均代理到后端服务：http://localhost:3000

## 注意事项

1. **后端依赖**: 本系统需要后端服务 (server/) 运行才能正常工作
2. **跨域处理**: 开发环境下通过 Vite 代理解决跨域问题
3. **权限控制**: 需要在后端实现 JWT 认证与权限验证
4. **数据校验**: 前端做了基础校验，但关键数据校验应在后端完成

## 与其他模块的关系

- **后端服务**: [`server/`](../server/) - 提供 API 接口、认证、实时聊天等服务
- **前台应用**: [`uniapp/`](../uniapp/) - UniApp 小程序/H5 客户端
- **数据库**: 使用 MySQL，表结构详见 [`secondhand.sql`](../secondhand.sql)

## 常见问题

### 无法连接到后端？

- 确认后端服务已启动并运行在 3000 端口
- 检查 `vite.config.ts` 中的代理配置是否正确
- 查看浏览器控制台 Network 面板中的请求状态

### 样式不生效？

- 确认 UnoCSS 配置正确
- 检查是否在组件中正确使用了类名

### TypeScript 报错？

- 运行 `npm run build` 查看详细错误信息
- 检查类型定义是否完整

---

## 📮 联系方式

- 👤 **作者**: LiuHaonan
- 📧 **Email**: 564644056@qq.com
