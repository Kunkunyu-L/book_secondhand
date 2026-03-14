## 二手书平台数据库结构说明（MySQL 5.5）

> 本文基于 `secondhand.sql`，覆盖 uniapp 前台与 admin 后台当前使用到的主要表。

### 1. 用户与账户相关

- **user**
  - **用途**：前台用户 / 客服 / 管理员统一用户表。
  - **关键字段**：
    - `id`：主键，自增。
    - `username`：登录账号，唯一。
    - `password`：加密密码。
    - `phone`：手机号，唯一。
    - `role`：`admin` / `user` / `customer_service`。
    - `role_id`：关联 `admin_role.id`（后台角色）。
    - `is_service`：是否客服。
    - `service_max_sessions`：客服最大会话数。
    - `avatar` / `nickname`：头像与昵称。
    - `credit_score`：信用分。
    - `status`：账号状态。
    - `account`：账户余额。

- **address**
  - **用途**：用户收货地址，用于下单时做快照。
  - **关键字段**：`user_id`，`name`，`phone`，省市区与详细地址，`is_default`。

- **user_violation**
  - **用途**：用户违规记录，配合后台违规处理。
  - **关键字段**：`user_id`，`type`（warning/freeze/unfreeze），`reason`，`admin_id`。

### 2. 图书与分类

- **book_category**
  - **用途**：书籍分类，前后台共用。
  - **关键字段**：`name`，`img`，`sort`，`status`。

- **platform_book**
  - **用途**：平台自营图书。
  - **关键字段**：`isbn`，`title`，`author`，`publisher`，`category`，`tags`，`status`，`cover_img`，`detail_imgs`，`description`，`sales_count`。

- **user_book**
  - **用途**：用户发布的二手图书。
  - **关键字段**：`user_id`，`isbn`，`title`，`author`，`category`，`status`（onsale/offline/reviewing/violation），`cover_img`，`detail_imgs`，`book_story`，`nope`（成交次数）。

- **book_condition_price**
  - **用途**：图书成色与价格信息（平台 / 用户复用）。
  - **关键字段**：
    - `type`：`platform` / `user`。
    - `book_id`：关联 `platform_book.id` 或 `user_book.id`。
    - `condition` / `condition_desc`：成色与描述。
    - `original_price` / `price`：原价与销售价。
    - `stock`：库存。

- **favorite**
  - **用途**：用户收藏图书（平台 / 用户书通用）。
  - **关键字段**：`user_id`，`book_id`，`book_type`。

### 3. 订单、支付与资金

- **orders**
  - **用途**：订单主表。
  - **关键字段**：`order_no`，`user_id`，`total_amount`，`status`，`address_snapshot`（JSON 文本），各时间字段。

- **order_items**
  - **用途**：订单明细。
  - **关键字段**：`order_id`，`book_id`，`book_type`，`title`，`cover_img`，`price`，`quantity`，`seller_id`。

- **payment_record**
  - **用途**：支付流水记录。
  - **关键字段**：`order_id`，`order_no`，`user_id`，`amount`，`payment_method`，`status`，`transaction_no`。

- **refund**
  - **用途**：退款 / 售后申请。
  - **关键字段**：`order_id`，`order_no`，`user_id`，`type`（refund/complaint），`reason`，`amount`，`status`，`admin_note`。

- **withdrawal**
  - **用途**：用户提现记录。
  - **关键字段**：`user_id`，`amount`，`status`，`account_info`，`admin_note`。

- **coupon / user_coupon**
  - **用途**：优惠券定义与用户领取使用。
  - **`coupon` 关键字段**：`name`，`type`（discount/reduction），`value`，`min_amount`，`start_time`，`end_time`，`total_count`，`used_count`，`status`。
  - **`user_coupon` 关键字段**：`user_id`，`coupon_id`，`status`，`used_at`。

### 4. 内容与运营

- **announcement**
  - **用途**：公告管理（admin 后台 + 前台展示）。
  - **关键字段**：`title`，`content`，`type`，`status`，`sort`，`admin_id`。

- **banner**
  - **用途**：首页轮播图。
  - **关键字段**：`image_url`，`link_url`，`title`，`sort`，`status`。

- **help_article**
  - **用途**：帮助中心文章（图文说明）。
  - **关键字段**：`title`，`content`（HTML），`category`，`sort`，`status`。

- **discover_post / discover_post_comment / discover_post_like**
  - **用途**：发现页帖子、评论与点赞。
  - **`discover_post`**：`user_id`，`content`，`images`，`like_count`，`comment_count`，`status`。
  - **`discover_post_comment`**：`post_id`，`user_id`，`reply_to_id`，`content`，`status`。
  - **`discover_post_like`**：`post_id`，`user_id`（唯一索引防重复点赞）。

### 5. 客服与工单

- **chat_session / chat_message**
  - **用途**：在线咨询会话与消息。
  - **`chat_session`**：`user_id`，`target_id`，`target_type`，`status`，`last_message`，`last_message_time`，`unread_user`，`unread_target`，`assigned_service`。
  - **`chat_message`**：`session_id`，`sender_id`，`sender_role`，`content`，`msg_type`，`is_read`。

- **service_ticket**
  - **用途**：客服工单。
  - **关键字段**：`ticket_no`，`user_id`，`type`，`title`，`content`，`status`，`priority`，`assigned_to`，`reply`，`admin_id`。

- **quick_reply_category / quick_reply**
  - **用途**：客服话术库（后台管理，前台客服可选用）。
  - **`quick_reply_category`**：`name`，`sort`。
  - **`quick_reply`**：`category_id`，`title`，`content`，`sort`。

- **faq_category / faq**
  - **用途**：FAQs（常见问题）分类与内容，对应 admin 的 FAQ 管理。
  - **`faq_category`**：`name`，`sort`，`status`。
  - **`faq`**：`category_id`，`question`，`answer`，`sort`，`status`。

### 6. 系统与配置

- **system_config**
  - **用途**：全局配置键值表，对应 admin 的“全局设置”页面。
  - **关键字段**：
    - `config_key`：如 `site_name`、`site_logo`、`service_phone`、`icp_number`、`app_name`、`app_slogan`、`contact_email`、`withdraw_min`、`withdraw_fee_rate`、`order_auto_confirm_days`、`book_audit_enabled`、`recommend_enabled`。
    - `config_value`：字符串形式存储实际配置值。

- **admin_role**
  - **用途**：后台角色与权限集合，对应 admin 端“角色管理”。
  - **关键字段**：`name`，`description`，`permissions`（JSON 字符串），`status`。

- **book_audit**
  - **用途**：图书审核记录（用户书 / 平台书），对应 admin 的“书籍审核”记录页。
  - **关键字段**：`book_id`，`book_type`（user/platform），`action`（approve/reject/violation），`reason`，`admin_id`。

- **notification_template / notification**
  - **用途**：站内通知模板与发送记录，对应 admin 的“通知模板”和“站内通知”。
  - **`notification_template`**：`name`，`type`，`subject`，`content`，`variables`，`status`。
  - **`notification`**：`user_id`（0=全体），`title`，`content`，`type`，`is_read`。

- **sys_user**
  - **用途**：预留的系统用户表（当前业务未直接使用，可作为后续后台账号扩展）。

---

### 7. 与前后端功能的对应关系概览

- **uniapp 前台**
  - 首页 / 分类 / 图书详情：`platform_book`，`user_book`，`book_category`，`book_condition_price`，`banner`。
  - 发现 / 动态：`discover_post`，`discover_post_comment`，`discover_post_like`。
  - 订单 / 支付 / 退款 / 提现：`orders`，`order_items`，`payment_record`，`refund`，`withdrawal`，`address`。
  - 优惠券：`coupon`，`user_coupon`。
  - 个人中心 / 设置：`user`，`system_config`，`notification`。

- **admin 后台**
  - 用户管理 / 违规管理：`user`，`user_violation`。
  - 图书管理 / 审核：`platform_book`，`user_book`，`book_condition_price`，`book_audit`，`book_category`。
  - 订单 / 支付 / 提现 / 退款：`orders`，`order_items`，`payment_record`，`withdrawal`，`refund`。
  - 内容管理：`announcement`，`banner`，`help_article`，`discover_post` 系列。
  - 客服管理：`chat_session`，`chat_message`，`service_ticket`，`quick_reply_category`，`quick_reply`，`faq_category`，`faq`。
  - 系统管理：`system_config`，`admin_role`，`notification_template`，`notification`。

