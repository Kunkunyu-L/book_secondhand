/*
 Navicat Premium Data Transfer

 Source Server         : secondhand
 Source Server Type    : MySQL
 Source Server Version : 50562
 Source Host           : 59.110.64.215:3306
 Source Schema         : secondhand

 Target Server Type    : MySQL
 Target Server Version : 50562
 File Encoding         : 65001

 Date: 14/03/2026 16:11:02
*/

SET NAMES utf8;
SET sql_mode = '';
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for address
-- ----------------------------
DROP TABLE IF EXISTS `address`;
CREATE TABLE `address`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '地址ID',
  `user_id` bigint(20) NOT NULL COMMENT '用户ID',
  `name` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '收货人姓名',
  `phone` varchar(11) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '收货人手机号',
  `province` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '省份',
  `city` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '城市',
  `district` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '区/县',
  `detail` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '详细地址',
  `is_default` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否默认地址: 1=是,0=否',
  `created_at` datetime NOT NULL COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_general_ci;

-- ----------------------------
-- Records of address
-- ----------------------------
INSERT INTO `address` VALUES (1, 1001, '平台', '19545696998', '湖南省', '长沙市', '岳麓区', '麓谷大道 100 号 图书大厦', 1, '2026-03-10 10:00:00', '2026-03-10 10:00:00');
INSERT INTO `address` VALUES (2, 1002, '昵称', '17275424776', '湖南省', '长沙市', '雨花区', '人民路 88 号 XX 小区 3-302', 0, '2026-03-10 10:05:00', '2026-03-10 10:05:00');

-- ----------------------------
-- Table structure for announcement
-- ----------------------------
DROP TABLE IF EXISTS `announcement`;
CREATE TABLE `announcement`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `title` varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '标题',
  `content` text CHARACTER SET utf8 COLLATE utf8_general_ci COMMENT '内容',
  `type` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL COMMENT '类型',
  `status` tinyint(1) DEFAULT 1 COMMENT '1=发布 0=草稿',
  `sort` int(11) DEFAULT NULL COMMENT '排序',
  `admin_id` bigint(20) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_general_ci;

-- ----------------------------
-- Records of announcement
-- ----------------------------
INSERT INTO `announcement` VALUES (1, '二手书平台上线啦', '欢迎体验校园二手书交易平台，支持发布闲置教材、购买平台自营图书。', 'notice', 1, 10, 1001, '2026-03-10 09:00:00', '2026-03-10 09:00:00');
INSERT INTO `announcement` VALUES (2, '开学季满减活动', '开学期间下单指定教材满 59 减 10 元，详情见活动页。', 'activity', 1, 9, 1001, '2026-03-10 09:30:00', '2026-03-10 09:30:00');

-- ----------------------------
-- Table structure for banner
-- ----------------------------
DROP TABLE IF EXISTS `banner`;
CREATE TABLE `banner`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `image_url` varchar(500) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL COMMENT '图片地址',
  `link_url` varchar(500) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL COMMENT '跳转链接',
  `title` varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL COMMENT '标题描述',
  `sort` int(11) DEFAULT NULL COMMENT '展示顺序',
  `status` tinyint(1) DEFAULT 1 COMMENT '1=显示 0=隐藏',
  `created_at` datetime DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8 COLLATE = utf8_general_ci;

-- ----------------------------
-- Records of banner
-- ----------------------------
INSERT INTO `banner` VALUES (2, 'https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', '', '1', 1, 1, NULL, '2026-02-14 21:48:28');
INSERT INTO `banner` VALUES (3, 'https://images.pexels.com/photos/1438081/pexels-photo-1438081.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', '', '1', 1, 1, NULL, '2026-02-14 21:48:38');

-- ----------------------------
-- Table structure for book_audit
-- ----------------------------
DROP TABLE IF EXISTS `book_audit`;
CREATE TABLE `book_audit`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '审核记录ID',
  `book_id` bigint(20) NOT NULL COMMENT '图书ID',
  `book_type` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '图书类型: user/platform',
  `action` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '操作类型: approve/reject/violation',
  `reason` varchar(500) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL COMMENT '原因说明',
  `admin_id` bigint(20) DEFAULT NULL COMMENT '操作管理员ID',
  `created_at` datetime DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_book`(`book_id`, `book_type`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_general_ci;

-- ----------------------------
-- Table structure for book_category
-- ----------------------------
DROP TABLE IF EXISTS `book_category`;
CREATE TABLE `book_category`  (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '分类唯一ID（自增主键）',
  `img` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL COMMENT '分类的图片',
  `name` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '分类名称 (如\"计算机\"\"文学小说\")',
  `sort` int(11) NOT NULL COMMENT '排序权重（数字越大，前端展示越靠前）',
  `status` tinyint(4) NOT NULL DEFAULT 1 COMMENT '状态: 1=启用（前端显示）, 0=禁用（仅后台可见）',
  `created_at` datetime NOT NULL COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8 COLLATE = utf8_general_ci;

-- ----------------------------
-- Records of book_category
-- ----------------------------
INSERT INTO `book_category` VALUES (1, '	https://ss1.7788js.com/app/zy/7788js/js_sp_new.png', '大学教材', 1, 1, '2025-11-18 15:36:21', '2025-11-19 17:55:12');
INSERT INTO `book_category` VALUES (2, '	https://ss1.7788js.com/app/zy/7788js/js_sp_new.png', '小说', 2, 1, '2025-11-18 15:36:32', '2025-11-19 17:55:13');
INSERT INTO `book_category` VALUES (3, '	https://ss1.7788js.com/app/zy/7788js/js_sp_new.png', '悬疑故事', 3, 1, '2025-11-18 15:36:46', '2025-11-19 17:55:15');
INSERT INTO `book_category` VALUES (4, 'https://ss1.7788js.com/app/zy/7788js/js_sp_new.png', '科技', 4, 1, '2025-11-19 17:59:30', '2026-02-07 21:12:18');

-- ----------------------------
-- Table structure for book_condition_price
-- ----------------------------
DROP TABLE IF EXISTS `book_condition_price`;
CREATE TABLE `book_condition_price`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '自增主键',
  `type` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL COMMENT '关联类型 (platform=平台, user=用户)',
  `book_id` bigint(20) DEFAULT NULL COMMENT '关联主表ID (platform_book.id 或 user_book.id)',
  `condition` tinyint(4) NOT NULL COMMENT '成色 (7-10分, 7=较新, 10=全新)',
  `condition_desc` varchar(500) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL COMMENT '成色详述 (如\"首页有轻微折痕, 内页完整\")',
  `original_price` decimal(10, 2) NOT NULL COMMENT '原价（元，供参考）',
  `price` decimal(10, 2) NOT NULL COMMENT '售价（平台统一价/用户自定义价）',
  `stock` int(11) NOT NULL COMMENT '库存（平台可批量，用户默认1）',
  `created_at` datetime DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8 COLLATE = utf8_general_ci;

-- ----------------------------
-- Records of book_condition_price
-- ----------------------------
INSERT INTO `book_condition_price` VALUES (1, 'platform', 1, 10, '全新', 45.00, 11.25, 1, NULL, '2026-02-14 21:24:28');
INSERT INTO `book_condition_price` VALUES (2, 'user', 1, 10, '全新', 69.00, 41.25, 0, NULL, '2026-02-14 21:24:28');
INSERT INTO `book_condition_price` VALUES (3, 'user', 2, 10, '全新', 69.00, 25.50, 0, NULL, '2026-02-14 21:24:28');
INSERT INTO `book_condition_price` VALUES (4, 'user', 3, 10, '全新', 100.00, 33.33, 1, NULL, '2026-02-14 21:24:28');
INSERT INTO `book_condition_price` VALUES (5, 'platform', 2, 10, '全新', 69.00, 33.05, 1, NULL, '2026-02-14 21:24:28');

-- ----------------------------
-- Table structure for chat_message
-- ----------------------------
DROP TABLE IF EXISTS `chat_message`;
CREATE TABLE `chat_message`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `session_id` bigint(20) NOT NULL COMMENT '会话ID',
  `sender_id` bigint(20) NOT NULL COMMENT '发送者ID',
  `sender_role` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '发送者角色',
  `content` text CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '消息内容',
  `msg_type` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '消息类型',
  `is_read` tinyint(1) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 37 CHARACTER SET = utf8 COLLATE = utf8_general_ci;

-- ----------------------------
-- Records of chat_message
-- ----------------------------
INSERT INTO `chat_message` VALUES (1, 1, 1001, 'admin', '1', 'text', 0, NULL, '2026-02-15 20:05:26');
INSERT INTO `chat_message` VALUES (2, 1, 1001, 'admin', '2', 'text', 0, NULL, '2026-02-15 20:05:29');
INSERT INTO `chat_message` VALUES (3, 1, 1001, 'admin', '5', 'text', 0, NULL, '2026-02-15 20:05:31');
INSERT INTO `chat_message` VALUES (4, 1, 1001, 'admin', '9', 'text', 0, NULL, '2026-02-15 20:05:33');
INSERT INTO `chat_message` VALUES (5, 1, 1001, 'admin', '8', 'text', 0, NULL, '2026-02-15 20:05:34');
INSERT INTO `chat_message` VALUES (6, 1, 1001, 'admin', '7', 'text', 0, NULL, '2026-02-15 20:05:35');
INSERT INTO `chat_message` VALUES (7, 1, 1001, 'admin', '1', 'text', 0, NULL, '2026-02-15 20:05:37');
INSERT INTO `chat_message` VALUES (8, 1, 1001, 'admin', '1', 'text', 0, NULL, '2026-02-15 20:06:15');
INSERT INTO `chat_message` VALUES (9, 1, 1001, 'admin', '1', 'text', 0, NULL, '2026-02-15 21:09:57');
INSERT INTO `chat_message` VALUES (10, 1, 1001, 'admin', '1', 'text', 0, NULL, '2026-02-15 21:10:00');
INSERT INTO `chat_message` VALUES (11, 1, 1001, 'admin', '2', 'text', 0, NULL, '2026-02-15 21:10:01');
INSERT INTO `chat_message` VALUES (12, 1, 1001, 'admin', '11', 'text', 0, NULL, '2026-02-15 21:14:57');
INSERT INTO `chat_message` VALUES (13, 1, 1001, 'admin', '11', 'text', 0, NULL, '2026-02-15 21:14:57');
INSERT INTO `chat_message` VALUES (14, 2, 1001, 'admin', '1', 'text', 0, NULL, '2026-02-15 21:15:00');
INSERT INTO `chat_message` VALUES (15, 2, 1001, 'admin', '1', 'text', 0, NULL, '2026-02-15 21:27:28');
INSERT INTO `chat_message` VALUES (16, 2, 1001, 'admin', '222', 'text', 0, NULL, '2026-02-15 21:27:32');
INSERT INTO `chat_message` VALUES (17, 2, 1001, 'admin', '222', 'text', 0, NULL, '2026-02-15 21:27:39');
INSERT INTO `chat_message` VALUES (18, 2, 1001, 'admin', '1', 'text', 0, NULL, '2026-02-15 21:27:43');
INSERT INTO `chat_message` VALUES (19, 2, 1001, 'admin', '111', 'text', 0, NULL, '2026-02-15 21:27:44');
INSERT INTO `chat_message` VALUES (20, 2, 1001, 'admin', '111', 'text', 0, NULL, '2026-02-15 21:27:46');
INSERT INTO `chat_message` VALUES (21, 2, 1001, 'admin', '1', 'text', 0, NULL, '2026-03-05 16:09:23');
INSERT INTO `chat_message` VALUES (22, 2, 1001, 'admin', '1', 'text', 0, NULL, '2026-03-05 16:09:25');
INSERT INTO `chat_message` VALUES (23, 2, 1001, 'admin', '1', 'text', 0, NULL, '2026-03-14 15:18:11');
INSERT INTO `chat_message` VALUES (24, 2, 1001, 'admin', '1', 'text', 0, NULL, '2026-03-14 15:18:11');
INSERT INTO `chat_message` VALUES (25, 2, 1001, 'admin', '1', 'text', 0, NULL, '2026-03-14 15:18:12');
INSERT INTO `chat_message` VALUES (26, 2, 1001, 'admin', '1', 'text', 0, NULL, '2026-03-14 15:18:13');
INSERT INTO `chat_message` VALUES (27, 2, 1001, 'admin', '1', 'text', 0, NULL, '2026-03-14 15:18:13');
INSERT INTO `chat_message` VALUES (28, 2, 1001, 'admin', '1', 'text', 0, NULL, '2026-03-14 15:18:14');
INSERT INTO `chat_message` VALUES (29, 2, 1001, 'admin', '1', 'text', 0, NULL, '2026-03-14 15:18:14');
INSERT INTO `chat_message` VALUES (30, 2, 1001, 'admin', '1', 'text', 0, NULL, '2026-03-14 15:18:14');
INSERT INTO `chat_message` VALUES (31, 2, 1001, 'admin', '1', 'text', 0, NULL, '2026-03-14 15:18:14');
INSERT INTO `chat_message` VALUES (32, 2, 1001, 'admin', '1', 'text', 0, NULL, '2026-03-14 15:18:14');
INSERT INTO `chat_message` VALUES (33, 2, 1001, 'admin', '1', 'text', 0, NULL, '2026-03-14 15:18:14');
INSERT INTO `chat_message` VALUES (34, 2, 1001, 'admin', '1', 'text', 0, NULL, '2026-03-14 15:18:15');
INSERT INTO `chat_message` VALUES (35, 2, 1001, 'admin', '1', 'text', 0, NULL, '2026-03-14 16:05:04');
INSERT INTO `chat_message` VALUES (36, 2, 1001, 'admin', '1', 'text', 0, NULL, '2026-03-14 16:05:04');

-- ----------------------------
-- Table structure for chat_session
-- ----------------------------
DROP TABLE IF EXISTS `chat_session`;
CREATE TABLE `chat_session`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL COMMENT '发起用户ID',
  `target_id` bigint(20) NOT NULL COMMENT '目标ID(卖家/客服)',
  `target_type` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '会话类型',
  `status` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `last_message` varchar(500) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL COMMENT '最后一条消息',
  `last_message_time` datetime DEFAULT NULL,
  `unread_user` int(11) DEFAULT NULL COMMENT '用户未读数',
  `unread_target` int(11) DEFAULT NULL COMMENT '目标方未读数',
  `assigned_service` bigint(20) DEFAULT NULL COMMENT '分配的客服ID',
  `created_at` datetime DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8 COLLATE = utf8_general_ci;

-- ----------------------------
-- Records of chat_session
-- ----------------------------
INSERT INTO `chat_session` VALUES (1, 1001, 0, 'service', 'closed', '11', '2026-02-15 21:14:57', 0, NULL, 1001, NULL, '2026-02-15 21:14:57');
INSERT INTO `chat_session` VALUES (2, 1001, 0, 'service', 'active', '1', '2026-03-14 16:05:04', 0, NULL, NULL, NULL, '2026-03-14 16:05:04');

-- ----------------------------
-- Table structure for coupon
-- ----------------------------
DROP TABLE IF EXISTS `coupon`;
CREATE TABLE `coupon`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '优惠券名称',
  `type` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT 'discount=折扣券(如0.8=八折), reduction=满减券',
  `value` decimal(10, 2) NOT NULL COMMENT '优惠值:折扣券为折扣率,满减券为减免金额',
  `min_amount` decimal(10, 2) DEFAULT NULL COMMENT '最低消费金额(满减门槛)',
  `start_time` datetime NOT NULL COMMENT '生效时间',
  `end_time` datetime NOT NULL COMMENT '过期时间',
  `total_count` int(11) DEFAULT NULL COMMENT '发放总量,0=不限',
  `used_count` int(11) DEFAULT NULL COMMENT '已使用数量',
  `status` tinyint(1) DEFAULT NULL COMMENT '1=启用, 0=禁用',
  `created_at` datetime DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_general_ci;

-- ----------------------------
-- Records of coupon
-- ----------------------------
INSERT INTO `coupon` VALUES (1, '新用户满 39 减 10', 'reduction', 10.00, 39.00, '2026-03-01 00:00:00', '2026-04-01 00:00:00', 1000, 0, 1, '2026-03-01 00:00:00', '2026-03-01 00:00:00');
INSERT INTO `coupon` VALUES (2, '教材 8 折券', 'discount', 0.80, 59.00, '2026-03-01 00:00:00', '2026-03-31 23:59:59', 500, 0, 1, '2026-03-01 00:00:00', '2026-03-01 00:00:00');

-- ----------------------------
-- Table structure for discover_post
-- ----------------------------
DROP TABLE IF EXISTS `discover_post`;
CREATE TABLE `discover_post`  (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` int(10) UNSIGNED NOT NULL COMMENT '发帖用户ID',
  `content` text CHARACTER SET utf8 COLLATE utf8_general_ci COMMENT '帖子正文',
  `images` varchar(1000) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL COMMENT '图片URL，逗号分隔',
  `like_count` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '点赞数',
  `comment_count` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '评论数',
  `status` tinyint(4) NOT NULL DEFAULT 1 COMMENT '1正常 0隐藏',
  `create_time` datetime NOT NULL COMMENT '创建时间',
  `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user_id`(`user_id`) USING BTREE,
  INDEX `idx_create_time`(`create_time`) USING BTREE,
  INDEX `idx_status`(`status`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '发现-用户帖子';

-- ----------------------------
-- Records of discover_post
-- ----------------------------
INSERT INTO `discover_post` VALUES (1, 1001, '你好', '', 1, 1, 1, '0000-00-00 00:00:00', '2026-03-14 16:06:08');

-- ----------------------------
-- Table structure for discover_post_comment
-- ----------------------------
DROP TABLE IF EXISTS `discover_post_comment`;
CREATE TABLE `discover_post_comment`  (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `post_id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL COMMENT '评论用户ID',
  `reply_to_id` int(10) UNSIGNED DEFAULT NULL COMMENT '回复的评论ID，NULL表示直接评论帖子',
  `content` varchar(500) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '评论内容',
  `status` tinyint(4) NOT NULL DEFAULT 1 COMMENT '1正常 0隐藏',
  `create_time` datetime NOT NULL COMMENT '评论时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_post_id`(`post_id`) USING BTREE,
  INDEX `idx_user_id`(`user_id`) USING BTREE,
  INDEX `idx_reply_to`(`reply_to_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '发现-帖子评论';

-- ----------------------------
-- Records of discover_post_comment
-- ----------------------------
INSERT INTO `discover_post_comment` VALUES (1, 1, 1001, NULL, '12', 1, '0000-00-00 00:00:00');

-- ----------------------------
-- Table structure for discover_post_like
-- ----------------------------
DROP TABLE IF EXISTS `discover_post_like`;
CREATE TABLE `discover_post_like`  (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `post_id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `create_time` datetime NOT NULL COMMENT '点赞时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_post_user`(`post_id`, `user_id`) USING BTREE,
  INDEX `idx_post_id`(`post_id`) USING BTREE,
  INDEX `idx_user_id`(`user_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '发现-帖子点赞';

-- ----------------------------
-- Records of discover_post_like
-- ----------------------------
INSERT INTO `discover_post_like` VALUES (2, 1, 1001, '0000-00-00 00:00:00');

-- ----------------------------
-- Table structure for faq
-- ----------------------------
DROP TABLE IF EXISTS `faq`;
CREATE TABLE `faq`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'FAQ主键',
  `category` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL COMMENT '分类名称',
  `question` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '问题',
  `answer` text CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '回答',
  `sort` int(11) DEFAULT 0 COMMENT '排序（降序，数值越大越靠前）',
  `status` tinyint(1) DEFAULT 1 COMMENT '1=启用 0=停用',
  `created_at` datetime DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_general_ci;

-- ----------------------------
-- Records of faq
-- ----------------------------
INSERT INTO `faq` VALUES (1, '下单与支付', '如何购买二手书？', '在首页或搜索页选择图书后点击“立即购买”，按照提示完成支付即可。', 100, 1, '2026-03-10 11:00:00', '2026-03-10 11:00:00');
INSERT INTO `faq` VALUES (2, '售后与退款', '收到的书籍破损怎么办？', '请在订单详情中发起退款/售后申请并上传实拍照片，客服会在 1 个工作日内处理。', 90, 1, '2026-03-10 11:05:00', '2026-03-10 11:05:00');

-- ----------------------------
-- Table structure for favorite
-- ----------------------------
DROP TABLE IF EXISTS `favorite`;
CREATE TABLE `favorite`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '收藏ID',
  `user_id` bigint(20) NOT NULL COMMENT '用户ID',
  `book_id` bigint(20) NOT NULL COMMENT '图书ID',
  `book_type` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '图书类型',
  `created_at` datetime NOT NULL COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_general_ci;

-- ----------------------------
-- Table structure for help_article
-- ----------------------------
DROP TABLE IF EXISTS `help_article`;
CREATE TABLE `help_article`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `title` varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '标题',
  `content` text CHARACTER SET utf8 COLLATE utf8_general_ci COMMENT '正文(HTML)',
  `category` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '分类',
  `sort` int(11) DEFAULT NULL COMMENT '排序',
  `status` tinyint(1) DEFAULT NULL COMMENT '1=发布 0=草稿',
  `created_at` datetime DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_general_ci;

-- ----------------------------
-- Table structure for notification
-- ----------------------------
DROP TABLE IF EXISTS `notification`;
CREATE TABLE `notification`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL COMMENT '接收用户(0=全部)',
  `title` varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `content` text CHARACTER SET utf8 COLLATE utf8_general_ci,
  `type` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `is_read` tinyint(1) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_general_ci;

-- ----------------------------
-- Table structure for notification_template
-- ----------------------------
DROP TABLE IF EXISTS `notification_template`;
CREATE TABLE `notification_template`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '模板名称',
  `type` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `subject` varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL COMMENT '标题/主题',
  `content` text CHARACTER SET utf8 COLLATE utf8_general_ci COMMENT '模板内容',
  `variables` varchar(500) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL COMMENT '可用变量说明',
  `status` tinyint(1) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_general_ci;

-- ----------------------------
-- Table structure for order_items
-- ----------------------------
DROP TABLE IF EXISTS `order_items`;
CREATE TABLE `order_items`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '订单明细ID',
  `order_id` bigint(20) NOT NULL COMMENT '订单ID (关联orders.id)',
  `book_id` bigint(20) NOT NULL COMMENT '图书ID',
  `book_type` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '图书类型',
  `title` varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '图书名称（快照）',
  `cover_img` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL COMMENT '封面图（快照）',
  `price` decimal(10, 2) NOT NULL COMMENT '购买单价（快照）',
  `quantity` int(11) NOT NULL COMMENT '购买数量',
  `seller_id` bigint(20) NOT NULL COMMENT '卖家ID',
  `created_at` datetime NOT NULL COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_general_ci;

-- ----------------------------
-- Table structure for orders
-- ----------------------------
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '订单ID',
  `order_no` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '订单编号（唯一）',
  `user_id` bigint(20) NOT NULL COMMENT '买家用户ID',
  `total_amount` decimal(10, 2) NOT NULL COMMENT '订单总金额',
  `status` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '订单状态: pending=待付款, paid=待发货, shipped=待收货, received=已完成, cancelled=已取消',
  `address_snapshot` text CHARACTER SET utf8 COLLATE utf8_general_ci COMMENT '收货地址快照（JSON格式，下单时记录）',
  `remark` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL COMMENT '买家备注',
  `pay_time` datetime DEFAULT NULL COMMENT '支付时间',
  `ship_time` datetime DEFAULT NULL COMMENT '发货时间',
  `receive_time` datetime DEFAULT NULL COMMENT '收货时间',
  `created_at` datetime NOT NULL COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `order_no`(`order_no`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_general_ci;

-- ----------------------------
-- Table structure for payment_record
-- ----------------------------
DROP TABLE IF EXISTS `payment_record`;
CREATE TABLE `payment_record`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `order_id` bigint(20) NOT NULL COMMENT '订单ID',
  `order_no` varchar(30) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL COMMENT '订单编号',
  `user_id` bigint(20) NOT NULL COMMENT '用户ID',
  `amount` decimal(10, 2) NOT NULL COMMENT '支付金额',
  `payment_method` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL COMMENT '支付方式: wechat/alipay/balance',
  `status` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '支付状态',
  `transaction_no` varchar(64) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL COMMENT '第三方交易流水号',
  `created_at` datetime DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_general_ci;

-- ----------------------------
-- Table structure for platform_book
-- ----------------------------
DROP TABLE IF EXISTS `platform_book`;
CREATE TABLE `platform_book`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '平台图书ID（自增主键）',
  `user_id` bigint(20) DEFAULT NULL COMMENT '关联平台id',
  `isbn` varchar(13) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT 'ISBN码（唯一标识，平台图书唯一）',
  `title` varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '书名',
  `author` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '作者',
  `publisher` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '出版社',
  `publish_date` varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL COMMENT '出版日期',
  `category` int(11) DEFAULT NULL COMMENT '图书分类',
  `tags` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL COMMENT '标签（逗号分隔，如\"计算机,考研\"）',
  `status` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '状态 (onsale=在售, offline=下架)',
  `cover_img` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL COMMENT '封面图URL（平台统一图）',
  `detail_imgs` text CHARACTER SET utf8 COLLATE utf8_general_ci COMMENT '详情图URL（逗号分隔）',
  `description` text CHARACTER SET utf8 COLLATE utf8_general_ci COMMENT '平台官方描述（区别于用户的book_story）',
  `sales_count` int(11) NOT NULL DEFAULT 0 COMMENT '总销量（平台特有，用于排序）',
  `create_datetime` datetime NOT NULL COMMENT '创建时间',
  `update_datetime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8 COLLATE = utf8_general_ci;

-- ----------------------------
-- Records of platform_book
-- ----------------------------
INSERT INTO `platform_book` VALUES (1, 1001, '9787302615439', '数字摄影与摄像', '詹青龙 袁东斌 刘光勇', '清华大学出版社', '2023-08', 1, '计算机,考研', 'onsale', 'https://www0.kfzimg.com/sw/kfz-cos/kfzimg/5126996/ea205f3a1ca80f92_s.jpg', 'https://www0.kfzimg.com/sw/kfz-cos/kfzimg/5126996/ea205f3a1ca80f92_s.jpg,https://www0.kfzimg.com/sw/kfz-cos/kfzimg/5126996/ea205f3a1ca80f92_s.jpg,https://www0.kfzimg.com/sw/kfz-cos/kfzimg/5126996/ea205f3a1ca80f92_s.jpg', '书籍保存完好，无破损无缺页，仅封面有轻微磨损，内页干净无笔记划线。购买后非质量问题不支持退货，请谨慎下单。', 0, '2025-11-18 15:07:51', '2025-11-24 09:51:08');
INSERT INTO `platform_book` VALUES (2, 1001, '9787572624681', '无法独处的现代人', '[英] 齐格蒙特·鲍曼著章艳 译', '湖南文艺出版社', '2025-07', 1, '计算机,考研', 'onsale', 'https://booklibimg.kfzimg.com/data/book_lib_img_v2/isbn/1/ed39/ed_0_1_300_300.jpg', 'https://booklibimg.kfzimg.com/data/book_lib_img_v2/isbn/1/ed39/ed_0_1_300_300.jpg,https://booklibimg.kfzimg.com/data/book_lib_img_v2/isbn/1/ed39/ed_0_1_300_300.jpg,https://booklibimg.kfzimg.com/data/book_lib_img_v2/isbn/1/ed39/ed_0_1_300_300.jpg', '', 0, '2025-11-20 22:06:42', '2026-03-09 17:14:25');
INSERT INTO `platform_book` VALUES (3, 1001, '9787302522119', '高等数学（第七版·上册）', '同济大学数学系', '高等教育出版社', '2023-01', 1, '高等数学,工科,教材', 'onsale', 'https://example.com/images/math-gaodengshuxue.jpg', 'https://example.com/images/math-gaodengshuxue-detail1.jpg,https://example.com/images/math-gaodengshuxue-detail2.jpg', '经典工科教材，适合大一高数课程，配套课后习题详解。', 0, '2026-03-10 10:20:00', '2026-03-10 10:20:00');

-- ----------------------------
-- Table structure for quick_reply
-- ----------------------------
DROP TABLE IF EXISTS `quick_reply`;
CREATE TABLE `quick_reply`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `category` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL COMMENT '分类名称',
  `title` varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '标题/关键词',
  `content` text CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '话术内容',
  `sort` int(11) DEFAULT NULL COMMENT '排序',
  `created_at` datetime DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_general_ci;

-- ----------------------------
-- Records of quick_reply
-- ----------------------------
INSERT INTO `quick_reply` VALUES (1, '售前咨询', '包邮规则', '您好，目前全场满 39 元包邮，偏远地区除外哦～', 100, '2026-03-10 11:10:00', '2026-03-10 11:10:00');
INSERT INTO `quick_reply` VALUES (2, '售后说明', '退货说明', '如非质量问题，签收后 7 日内支持退货，运费由买家承担。', 90, '2026-03-10 11:12:00', '2026-03-10 11:12:00');

-- ----------------------------
-- Table structure for refund
-- ----------------------------
DROP TABLE IF EXISTS `refund`;
CREATE TABLE `refund`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `order_id` bigint(20) NOT NULL COMMENT '关联订单ID',
  `order_no` varchar(30) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL COMMENT '订单编号',
  `user_id` bigint(20) NOT NULL COMMENT '申请用户ID',
  `type` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '类型: refund=退款, complaint=售后投诉',
  `reason` varchar(500) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '申请理由',
  `amount` decimal(10, 2) NOT NULL COMMENT '退款金额',
  `status` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '处理状态',
  `admin_note` varchar(500) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL COMMENT '管理员处理备注',
  `created_at` datetime DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_general_ci;

-- ----------------------------
-- Table structure for service_ticket
-- ----------------------------
DROP TABLE IF EXISTS `service_ticket`;
CREATE TABLE `service_ticket`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `ticket_no` varchar(30) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '工单编号',
  `user_id` bigint(20) NOT NULL COMMENT '用户ID',
  `type` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `title` varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `content` text CHARACTER SET utf8 COLLATE utf8_general_ci COMMENT '描述',
  `status` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `priority` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `assigned_to` bigint(20) DEFAULT NULL COMMENT '分配给谁',
  `reply` text CHARACTER SET utf8 COLLATE utf8_general_ci COMMENT '处理回复',
  `admin_id` bigint(20) DEFAULT NULL COMMENT '处理人',
  `created_at` datetime DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_general_ci;

-- ----------------------------
-- Table structure for sys_user
-- ----------------------------
-- ----------------------------
-- Table structure for system_config
-- ----------------------------
DROP TABLE IF EXISTS `system_config`;
CREATE TABLE `system_config`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `config_key` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '配置键',
  `config_value` text CHARACTER SET utf8 COLLATE utf8_general_ci COMMENT '配置值',
  `description` varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL COMMENT '说明',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 14 CHARACTER SET = utf8 COLLATE = utf8_general_ci;

-- ----------------------------
-- Records of system_config
-- ----------------------------
INSERT INTO `system_config` VALUES (1, 'site_name', '1', NULL, '2026-03-10 13:42:41');
INSERT INTO `system_config` VALUES (2, 'site_logo', '', NULL, '2026-03-10 13:42:41');
INSERT INTO `system_config` VALUES (3, 'service_phone', '', NULL, '2026-03-10 13:42:41');
INSERT INTO `system_config` VALUES (4, 'icp_number', '', NULL, '2026-03-10 13:42:41');
INSERT INTO `system_config` VALUES (5, 'site_description', '', NULL, '2026-03-10 13:42:41');
INSERT INTO `system_config` VALUES (6, 'app_name', '', NULL, '2026-03-10 13:42:42');
INSERT INTO `system_config` VALUES (7, 'app_slogan', '', NULL, '2026-03-10 13:42:42');
INSERT INTO `system_config` VALUES (8, 'contact_email', '', NULL, '2026-03-10 13:42:42');
INSERT INTO `system_config` VALUES (9, 'withdraw_min', '', NULL, '2026-03-10 13:42:42');
INSERT INTO `system_config` VALUES (10, 'withdraw_fee_rate', '', NULL, '2026-03-10 13:42:42');
INSERT INTO `system_config` VALUES (11, 'order_auto_confirm_days', '7', NULL, '2026-03-10 13:42:42');
INSERT INTO `system_config` VALUES (12, 'book_audit_enabled', '0', NULL, '2026-03-10 13:42:42');
INSERT INTO `system_config` VALUES (13, 'recommend_enabled', '1', NULL, '2026-03-10 13:42:42');
INSERT INTO `system_config` VALUES (14, 'role_page_permission', '{"superAdmin":["/dashboard","/categories","/platform-books","/user-books","/orders","/refunds","/order-stats","/users","/violations","/payments","/withdrawals","/coupons","/announcements","/banners","/discover-posts","/chat-sessions","/tickets","/faq-manage","/system-config","/role-pages"],"operationAdmin":["/dashboard","/categories","/platform-books","/user-books","/orders","/refunds","/order-stats","/users","/violations","/payments","/withdrawals","/coupons","/announcements","/banners","/discover-posts","/system-config"],"customerService":["/dashboard","/chat-sessions","/tickets","/faq-manage"],"user":[]}', NULL, '2026-03-14 18:00:00');

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '用户唯一ID（自增，无业务含义）',
  `username` varchar(30) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '登录账号（字母/数字/下划线，唯一）',
  `password` varchar(64) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '密码（加密存储，如BCrypt/SHA256）',
  `phone` varchar(11) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '手机号（唯一，自动满足前述）',
  `role` varchar(30) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL COMMENT '角色：superAdmin（超级管理员）、operationAdmin（运营管理员）、customerService（客服）、user（普通用户）',
  `is_service` tinyint(1) DEFAULT NULL COMMENT '是否客服',
  `service_max_sessions` int(11) DEFAULT NULL COMMENT '客服最大接待量',
  `avatar` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL COMMENT '用户头像（移动端显示，存OSS/CDN地址）',
  `nickname` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL COMMENT '用户的昵称',
  `credit_score` int(11) DEFAULT 100 COMMENT '信用分（初始100，好评+1，差评-2，低于80限制发布）',
  `status` tinyint(1) DEFAULT 1 COMMENT '账号状态：1（正常）、0（禁用，违规/投诉过多）',
  `account` int(11) DEFAULT 0 COMMENT '用户余额，可用于提现',
  `created_at` datetime NOT NULL COMMENT '注册时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '信息更新时间（管理更新等）',
  `school` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL COMMENT '学校',
  `major` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL COMMENT '专业',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `username`(`username`) USING BTREE,
  UNIQUE INDEX `phone`(`phone`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1007 CHARACTER SET = utf8 COLLATE = utf8_general_ci;

-- ----------------------------
-- Records of user
-- ----------------------------
INSERT INTO `user` VALUES (1001, 'admin', '$2b$10$7XIOjLf/9mdyeKsp3vJOjeRGrQKPfK0cd9jdUEd4VNrJunXy1fPf6', '19545696998', 'superAdmin', NULL, 0, 'https://youke1.picui.cn/s1/2025/11/20/691f03c2b5a72.jpg', '平台', 100, 1, NULL, '2025-11-17 17:32:22', '2026-03-06 09:47:13', NULL, NULL);
INSERT INTO `user` VALUES (1002, 'admin1', '$2b$10$Dpew8zO1KeEQHA64tOBizekU2RLDNDk/w28KHLtoH3dxmXFhHEly6', '', 'user', NULL, 0, 'https://youke1.picui.cn/s1/2025/11/20/691f03c2b5a72.jpg', '昵称', 100, 1, NULL, '2025-11-17 17:42:32', '2025-11-20 20:05:46', NULL, NULL);
INSERT INTO `user` VALUES (1005, 'admin2', '$2b$10$Bh3/3EuyJfs3UEVmf2bk3ukqlAj9.M7GeAIgVCqmBSc0y1RoBIWzS', '17275424776', 'customerService', NULL, 0, '默认头像URL', '昵称', 100, 1, NULL, '2025-11-19 15:29:10', '2026-03-06 10:32:32', NULL, NULL);
INSERT INTO `user` VALUES (1006, 'liuhaonan', '$2b$10$Krne03n5xEfDY6u2dm.xVOsULYRUG1JOE/G/b/a3z2jwhpoV1tKIS', '18773355531', 'user', NULL, NULL, NULL, NULL, 100, 1, 0, '0000-00-00 00:00:00', '2026-02-15 23:56:13', NULL, NULL);

-- ----------------------------
-- Table structure for user_book
-- ----------------------------
DROP TABLE IF EXISTS `user_book`;
CREATE TABLE `user_book`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '用户图书ID（自增主键）',
  `user_id` bigint(20) NOT NULL COMMENT '卖家用户ID（关联用户表user.id）',
  `isbn` varchar(13) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT 'ISBN码（非唯一，同一ISBN可有多用户售卖）',
  `title` varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '书名',
  `author` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '作者',
  `publisher` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '出版社',
  `publish_date` varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL COMMENT '出版日期',
  `category` int(11) NOT NULL COMMENT '图书分类',
  `tags` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL COMMENT '标签（逗号分隔）',
  `status` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '状态（onsale=在售，sold=已售，offline=下架）',
  `cover_img` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL COMMENT '封面图URL（用户实拍图）',
  `detail_imgs` text CHARACTER SET utf8 COLLATE utf8_general_ci COMMENT '详情图URL（逗号分隔，用户实拍）',
  `book_story` text CHARACTER SET utf8 COLLATE utf8_general_ci COMMENT '卖家描述（如\"考研核心资料，轻微笔记\"）',
  `nope` int(11) NOT NULL DEFAULT 0 COMMENT '付款次数（用于热门排序）',
  `create_datetime` datetime NOT NULL COMMENT '发布时间',
  `update_datetime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8 COLLATE = utf8_general_ci;

-- ----------------------------
-- Records of user_book
-- ----------------------------
INSERT INTO `user_book` VALUES (1, 1002, '9787521773088', '觉照', '[美] 杰夫·卡普', '中信出版社', '2025-07', 1, '计算机,考研', 'onsale', 'https://booklibimg.kfzimg.com/data/book_lib_img_v2/isbn/1/23b1/2_0_1_300_300.jpg', 'https://booklibimg.kfzimg.com/data/book_lib_img_v2/isbn/1/23b1/2_0_1_300_300.jpg,https://booklibimg.kfzimg.com/data/book_lib_img_v2/isbn/1/23b1/2_0_1_300_300.jpg,https://booklibimg.kfzimg.com/data/book_lib_img_v2/isbn/1/23b1/2_0_1_300_300.jpg', '书籍保存完好，无破损无缺页，仅封面有轻微磨损，内页干净无笔记划线。购买后非质量问题不支持退货，请谨慎下单。', 1, '2025-11-20 19:39:12', '2026-02-07 19:12:40');
INSERT INTO `user_book` VALUES (2, 1002, '9787220139291', '克林索尔的最后一个夏天', '[德] 赫尔曼·黑塞', '四川人民出版社', '2025-06', 1, '计算机,考研', 'onsale', 'https://booklibimg.kfzimg.com/data/book_lib_img_v2/isbn/1/d2ea/d2ea4006e9ef5c32910ef63cf457710f_0_1_300_300.jpg', 'https://booklibimg.kfzimg.com/data/book_lib_img_v2/isbn/1/d2ea/d2ea4006e9ef5c32910ef63cf457710f_0_1_300_300.jpg,https://booklibimg.kfzimg.com/data/book_lib_img_v2/isbn/1/d2ea/d2ea4006e9ef5c32910ef63cf457710f_0_1_300_300.jpg,https://booklibimg.kfzimg.com/data/book_lib_img_v2/isbn/1/d2ea/d2ea4006e9ef5c32910ef63cf457710f_0_1_300_300.jpg', '书籍保存完好，无破损无缺页，仅封面有轻微磨损，内页干净无笔记划线。购买后非质量问题不支持退货，请谨慎下单。', 0, '2025-11-20 22:00:27', '2025-11-24 09:37:07');
INSERT INTO `user_book` VALUES (3, 1002, '9787208195530', '林门郑氏', '[马来西亚] 林雪虹 著', '上海人民出版社', '2025-07', 1, '计算机,考研', 'onsale', 'https://booklibimg.kfzimg.com/data/book_lib_img_v2/isbn/1/3365/_0_1_300_300.jpg', 'https://booklibimg.kfzimg.com/data/book_lib_img_v2/isbn/1/3365/_0_1_300_300.jpg,https://booklibimg.kfzimg.com/data/book_lib_img_v2/isbn/1/3365/_0_1_300_300.jpg,https://booklibimg.kfzimg.com/data/book_lib_img_v2/isbn/1/3365/_0_1_300_300.jpg', '', 0, '2025-11-20 22:01:39', '2026-02-07 19:42:07');

-- ----------------------------
-- Table structure for user_coupon
-- ----------------------------
DROP TABLE IF EXISTS `user_coupon`;
CREATE TABLE `user_coupon`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL COMMENT '用户ID',
  `coupon_id` bigint(20) NOT NULL COMMENT '优惠券ID',
  `status` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL COMMENT '使用状态',
  `used_at` datetime DEFAULT NULL COMMENT '使用时间',
  `created_at` datetime DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_general_ci;

-- ----------------------------
-- Table structure for user_violation
-- ----------------------------
DROP TABLE IF EXISTS `user_violation`;
CREATE TABLE `user_violation`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL COMMENT '用户ID',
  `type` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '处理类型: warning=警告, freeze=冻结, unfreeze=解冻',
  `reason` varchar(500) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '违规/处理原因',
  `admin_id` bigint(20) DEFAULT NULL COMMENT '操作管理员ID',
  `created_at` datetime DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_general_ci;

-- ----------------------------
-- Table structure for withdrawal
-- ----------------------------
DROP TABLE IF EXISTS `withdrawal`;
CREATE TABLE `withdrawal`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL COMMENT '用户ID',
  `amount` decimal(10, 2) NOT NULL COMMENT '提现金额',
  `status` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '状态',
  `account_info` varchar(500) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL COMMENT '提现账户信息(银行卡/支付宝等)',
  `admin_note` varchar(500) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL COMMENT '管理员备注',
  `created_at` datetime DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_general_ci;

SET FOREIGN_KEY_CHECKS = 1;
