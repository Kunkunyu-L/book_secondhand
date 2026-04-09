## 公共接口总览（server）

> 说明：所有路径均以 `http://服务器地址:3000` 为前缀，除特别标注“公开”外，其余接口默认需要登录携带 Token。

---

### 一、首页 / 公共内容（`/home`，大部分公开）

- **GET `/home/config`**：获取系统配置（站点名称、客服电话等），供前台展示。
- **GET `/home/categories/level1`**：获取一级图书分类列表。
- **GET `/home/books/platform`**：平台自营图书列表。
- **GET `/home/books/userbook`**：用户发布的闲置图书列表。
- **GET `/home/books/market`**：书市混合列表（平台+用户，登录用户智能排序，未登录随机排序）。
- **GET `/home/books/recommend`**：智能推荐接口（需登录），基于用户专业、图书分类、热度、时间等多维度计算推荐分数，参数 `limit`（可选，默认20）。
- **POST `/home/books/detail`**：获取图书详情，参数 `bookId`、`bookType`（`user` / `platform`）。
- **GET `/home/books/search`**：搜索图书，参数 `keyword`、`category`。
- **GET `/home/banners`**：轮播图列表（启用中的）。
- **GET `/home/announcements`**：公告列表，参数 `type` 可选。
- **GET `/home/announcements/detail`**：公告详情，参数 `id`。
- **GET `/home/help-articles`**：帮助文章列表，可按 `category` 过滤。
- **GET `/home/help-articles/detail`**：帮助文章详情，参数 `id`。
- **GET `/home/faq`**：FAQ 列表，可按 `category`、`keyword` 查询。
- **GET `/home/coupons`**：当前可领取的优惠券列表。

---

---

### 三、用户基础（`/api`，公开）

- **POST `/api/register`**：注册。
- **GET `/api/captcha`**：获取登录验证码（算式）。
- **POST `/api/login`**：登录，返回 Token。

---

### 四、登录后用户信息（`/my`）

- **GET `/my/getUserInfo`**：获取当前登录用户信息。
- **PUT `/my/updateProfile`**：更新用户资料。
- **PUT `/my/updatePassword`**：修改密码。
- **POST `/my/logout`**：退出登录。

---

### 五、地址管理（`/address`）

- **GET `/address/list`**：地址列表。
- **POST `/address/add`**：新增地址。
- **PUT `/address/update`**：更新地址。
- **DELETE `/address/remove`**：删除地址。
- **PUT `/address/setDefault`**：设为默认地址。

---

### 六、订单（`/order`）

- **POST `/order/create`**：创建订单。
- **GET `/order/list`**：订单列表，可按状态筛选（具体参数见实现）。
- **GET `/order/detail`**：订单详情。
- **PUT `/order/status`**：更新订单状态（支付、取消等）。
- **GET `/order/count`**：订单数量统计（用于“我买到的”“我卖出的”等）。

---

### 七、收藏（`/favorite`）

- **GET `/favorite/list`**：收藏列表。
- **POST `/favorite/add`**：添加收藏。
- **DELETE `/favorite/remove`**：取消收藏。
- **GET `/favorite/check`**：检查是否已收藏（常用于详情页“是否已收藏”）。

---

### 八、发布 / 我的闲置（`/publish`）

- **POST `/publish/book`**：发布图书（用户卖书）。
- **GET `/publish/book/detail`**：获取单本用户图书（编辑用）。
- **PUT `/publish/book`**：更新用户图书。
- **GET `/publish/mybooks`**：我发布的所有图书。
- **PUT `/publish/book/status`**：更新图书状态（上架 / 下架）。
- **DELETE `/publish/book`**：删除图书。

---

### 九、发现 / 帖子（`/discover`）

- **GET `/discover/posts`**：帖子列表（公开）。
- **GET `/discover/my-posts`**：我发布的帖子（登录）。
- **POST `/discover/posts`**：发布帖子（登录）。
- **POST `/discover/posts/:id/like`**：点赞 / 取消点赞（登录）。
- **GET `/discover/posts/:id/liked`**：是否已点赞（登录）。
- **GET `/discover/posts/:id/comments`**：评论列表（公开）。
- **POST `/discover/posts/:id/comments`**：发表评论（登录）。

---

### 十、聊天（`/chat` + Socket）

**REST 部分：**

- **GET `/chat/sessions`**：当前用户的会话列表（支持 `role=user/seller/service`）。
- **GET `/chat/messages`**：会话消息列表，参数 `session_id`、`page`、`pageSize`。
- **POST `/chat/session`**：创建会话，参数 `target_id`、`target_type`（`seller` / `service`）。
- **POST `/chat/messages`**：发送一条消息（REST 兜底），参数 `session_id`、`content`、`msg_type`。

**Socket 事件（简要）：**

- `send_message`：发送消息（实时）。
- `create_session`：创建会话。
- `mark_read`：标记已读。
- `assign_session`：客服接入会话。

---

### 十一、前台客户端其他功能（`/client`）

- **POST `/client/refund`**：申请退款。
- **GET `/client/refunds`**：我的退款列表。
- **POST `/client/ticket`**：创建工单 / 咨询。
- **GET `/client/tickets`**：我的工单列表。
- **GET `/client/ticket/detail`**：工单详情。
- **POST `/client/coupon/claim`**：领取优惠券。
- **GET `/client/coupons`**：我的优惠券。
- **GET `/client/notifications`**：站内通知列表。
- **PUT `/client/notifications/read`**：标记通知已读。
- **GET `/client/notifications/unread-count`**：未读通知数量。

---

### 十二、管理后台（`/admin`，需要管理员权限）

这里只做模块级别概览，具体字段可参考 `server/router/admin.js` 与对应的 `router_handler`：

- **仪表盘**：`GET /admin/dashboard`
- **用户管理**：`/admin/users`（列表、新增、状态、角色）
- **违规处理**：`/admin/violations`
- **分类管理**：`/admin/categories`
- **平台图书管理**：`/admin/books/platform`
- **用户图书管理 / 审核**：`/admin/books/user`、`/admin/books/audit`
- **订单 / 退款 / 统计 / 支付 / 提现**：`/admin/orders*`、`/admin/refunds*`、`/admin/payments`、`/admin/withdrawals*`
- **优惠券管理**：`/admin/coupons*`
- **帖子 & 评论管理**：`/admin/discover/posts`、`/admin/discover/comments`
- **内容管理（公告 / 帮助 / 轮播）**：`/admin/announcements*`、`/admin/help-articles*`、`/admin/banners*`
- **客服相关（人员 / 会话 / 工单 / FAQ / 话术）**：`/admin/service-staff*`、`/admin/chat/sessions*`、`/admin/tickets*`、`/admin/faq*`、`/admin/quick-reply*`
- **系统（配置 / 通知模板 / 站内通知）**：`/admin/configs*`、`/admin/notification-templates*`、`/admin/notifications*`

