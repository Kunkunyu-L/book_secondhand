-- ============================================
-- 二手书交易系统 - 数据库更新脚本
-- 在 MySQL 中执行此文件以添加新表
-- ============================================

USE book_secondhand;

-- 1. 购物车表
CREATE TABLE IF NOT EXISTS `cart` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '购物车项ID',
  `user_id` bigint(20) NOT NULL COMMENT '用户ID（关联user.id）',
  `book_id` bigint(20) NOT NULL COMMENT '图书ID（关联platform_book或user_book的id）',
  `book_type` enum('platform','user') NOT NULL COMMENT '图书类型：platform=平台, user=用户',
  `quantity` int(11) NOT NULL DEFAULT 1 COMMENT '数量',
  `selected` tinyint(1) NOT NULL DEFAULT 1 COMMENT '是否选中：1=选中, 0=未选中',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  UNIQUE KEY `uk_user_book` (`user_id`, `book_id`, `book_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='购物车表';

-- 2. 收货地址表
CREATE TABLE IF NOT EXISTS `address` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '地址ID',
  `user_id` bigint(20) NOT NULL COMMENT '用户ID',
  `name` varchar(50) NOT NULL COMMENT '收货人姓名',
  `phone` varchar(11) NOT NULL COMMENT '收货人手机号',
  `province` varchar(50) NOT NULL COMMENT '省份',
  `city` varchar(50) NOT NULL COMMENT '城市',
  `district` varchar(50) NOT NULL COMMENT '区/县',
  `detail` varchar(255) NOT NULL COMMENT '详细地址',
  `is_default` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否默认地址：1=是, 0=否',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='收货地址表';

-- 3. 订单表
CREATE TABLE IF NOT EXISTS `orders` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '订单ID',
  `order_no` varchar(32) NOT NULL COMMENT '订单编号（唯一）',
  `user_id` bigint(20) NOT NULL COMMENT '买家用户ID',
  `total_amount` decimal(10,2) NOT NULL COMMENT '订单总金额',
  `status` varchar(20) NOT NULL DEFAULT 'pending' COMMENT '订单状态：pending=待付款, paid=待发货, shipped=待收货, completed=已完成, cancelled=已取消',
  `address_snapshot` text COMMENT '收货地址快照（JSON格式，下单时记录）',
  `remark` varchar(255) DEFAULT NULL COMMENT '买家备注',
  `pay_time` datetime DEFAULT NULL COMMENT '支付时间',
  `ship_time` datetime DEFAULT NULL COMMENT '发货时间',
  `receive_time` datetime DEFAULT NULL COMMENT '收货时间',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_no` (`order_no`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';

-- 4. 订单明细表
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '订单明细ID',
  `order_id` bigint(20) NOT NULL COMMENT '订单ID（关联orders.id）',
  `book_id` bigint(20) NOT NULL COMMENT '图书ID',
  `book_type` enum('platform','user') NOT NULL COMMENT '图书类型',
  `title` varchar(200) NOT NULL COMMENT '图书名称（快照）',
  `cover_img` varchar(255) DEFAULT NULL COMMENT '封面图（快照）',
  `price` decimal(10,2) NOT NULL COMMENT '购买单价（快照）',
  `quantity` int(11) NOT NULL DEFAULT 1 COMMENT '购买数量',
  `seller_id` bigint(20) DEFAULT NULL COMMENT '卖家ID',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_order_id` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单明细表';

-- 5. 收藏表
CREATE TABLE IF NOT EXISTS `favorite` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '收藏ID',
  `user_id` bigint(20) NOT NULL COMMENT '用户ID',
  `book_id` bigint(20) NOT NULL COMMENT '图书ID',
  `book_type` enum('platform','user') NOT NULL COMMENT '图书类型',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_book` (`user_id`, `book_id`, `book_type`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='收藏表';
