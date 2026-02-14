-- ============================================================
-- 二手书交易系统 - 数据库更新 V2（后台管理系统增强）
-- 执行前请先备份数据库！
-- ============================================================

-- 1. 书籍审核记录表
CREATE TABLE IF NOT EXISTS `book_audit` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `book_id` bigint(20) NOT NULL COMMENT '图书ID',
  `book_type` enum('platform','user') NOT NULL DEFAULT 'user' COMMENT '图书类型',
  `action` enum('approve','reject','violation') NOT NULL COMMENT '审核动作',
  `reason` varchar(500) DEFAULT NULL COMMENT '驳回/违规理由',
  `admin_id` bigint(20) DEFAULT NULL COMMENT '审核管理员ID',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_book` (`book_id`, `book_type`),
  KEY `idx_admin` (`admin_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='书籍审核记录表';

-- 2. 退款/售后表
CREATE TABLE IF NOT EXISTS `refund` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `order_id` bigint(20) NOT NULL COMMENT '关联订单ID',
  `order_no` varchar(30) DEFAULT NULL COMMENT '订单编号',
  `user_id` bigint(20) NOT NULL COMMENT '申请用户ID',
  `type` enum('refund','complaint') NOT NULL DEFAULT 'refund' COMMENT '类型: refund=退款, complaint=售后投诉',
  `reason` varchar(500) NOT NULL COMMENT '申请理由',
  `amount` decimal(10,2) DEFAULT 0.00 COMMENT '退款金额',
  `status` enum('pending','approved','rejected','negotiating') NOT NULL DEFAULT 'pending' COMMENT '处理状态',
  `admin_note` varchar(500) DEFAULT NULL COMMENT '管理员处理备注',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order` (`order_id`),
  KEY `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='退款售后表';

-- 3. 用户违规记录表
CREATE TABLE IF NOT EXISTS `user_violation` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL COMMENT '用户ID',
  `type` enum('warning','freeze','unfreeze') NOT NULL COMMENT '处理类型: warning=警告, freeze=冻结, unfreeze=解封',
  `reason` varchar(500) NOT NULL COMMENT '违规/处理原因',
  `admin_id` bigint(20) DEFAULT NULL COMMENT '操作管理员ID',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户违规记录表';

-- 4. 支付记录表
CREATE TABLE IF NOT EXISTS `payment_record` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `order_id` bigint(20) NOT NULL COMMENT '订单ID',
  `order_no` varchar(30) DEFAULT NULL COMMENT '订单编号',
  `user_id` bigint(20) NOT NULL COMMENT '用户ID',
  `amount` decimal(10,2) NOT NULL COMMENT '支付金额',
  `payment_method` varchar(50) DEFAULT 'wechat' COMMENT '支付方式: wechat/alipay/balance',
  `status` enum('pending','success','failed','refunded') NOT NULL DEFAULT 'pending' COMMENT '支付状态',
  `transaction_no` varchar(64) DEFAULT NULL COMMENT '第三方交易流水号',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order` (`order_id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_transaction` (`transaction_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='支付记录表';

-- 5. 提现记录表
CREATE TABLE IF NOT EXISTS `withdrawal` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL COMMENT '用户ID',
  `amount` decimal(10,2) NOT NULL COMMENT '提现金额',
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending' COMMENT '状态',
  `account_info` varchar(500) DEFAULT NULL COMMENT '提现账户信息(银行卡/支付宝等)',
  `admin_note` varchar(500) DEFAULT NULL COMMENT '管理员备注',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='提现记录表';

-- 6. 优惠券表
CREATE TABLE IF NOT EXISTS `coupon` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL COMMENT '优惠券名称',
  `type` enum('discount','reduction') NOT NULL COMMENT 'discount=折扣券(如0.8=八折), reduction=满减券',
  `value` decimal(10,2) NOT NULL COMMENT '优惠值: 折扣券为折扣率, 满减券为减免金额',
  `min_amount` decimal(10,2) DEFAULT 0.00 COMMENT '最低消费金额(满减门槛)',
  `start_time` datetime NOT NULL COMMENT '生效时间',
  `end_time` datetime NOT NULL COMMENT '过期时间',
  `total_count` int(11) DEFAULT 0 COMMENT '发放总量, 0=不限',
  `used_count` int(11) DEFAULT 0 COMMENT '已使用数量',
  `status` tinyint(1) DEFAULT 1 COMMENT '1=启用, 0=禁用',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='优惠券表';

-- 7. 用户优惠券关联表
CREATE TABLE IF NOT EXISTS `user_coupon` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL COMMENT '用户ID',
  `coupon_id` bigint(20) NOT NULL COMMENT '优惠券ID',
  `status` enum('unused','used','expired') NOT NULL DEFAULT 'unused' COMMENT '使用状态',
  `used_at` datetime DEFAULT NULL COMMENT '使用时间',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_coupon` (`coupon_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户优惠券关联表';

-- ============================================================
-- 提示：如需开启「发布即审核」流程，可修改 server/router_handler/publish.js
-- 将 publishBook 函数中 status: "onsale" 改为 status: "reviewing"
-- 这样用户发布的图书默认进入审核状态，需管理员审核通过后才上架
-- ============================================================
