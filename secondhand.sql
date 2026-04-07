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

 Date: 07/04/2026 13:23:57
*/

SET NAMES utf8mb4;
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
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Compact;

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
) ENGINE = InnoDB AUTO_INCREMENT = 7 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of announcement
-- ----------------------------
INSERT INTO `announcement` VALUES (5, '2026.3.20号正式上线，欢迎提出bug', '2026.3.20号正式上线，欢迎提出bug', 'notice', 1, 1, 1001, '2026-03-20 23:21:41', '2026-03-20 23:21:41');

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
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Compact;

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
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Compact;

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
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Compact;

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
  `price` decimal(10, 2) NOT NULL COMMENT '售价',
  `stock` int(11) NOT NULL COMMENT '库存',
  `created_at` datetime DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 15 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of book_condition_price
-- ----------------------------
INSERT INTO `book_condition_price` VALUES (1, 'platform', 1, 10, '全新', 45.00, 11.25, 0, NULL, '2026-03-20 17:08:15');
INSERT INTO `book_condition_price` VALUES (3, 'user', 2, 10, '全新', 69.00, 25.50, 0, NULL, '2026-02-14 21:24:28');
INSERT INTO `book_condition_price` VALUES (8, 'platform', 4, 10, '全新', 35.00, 5.00, 10, NULL, '2026-03-20 23:26:56');
INSERT INTO `book_condition_price` VALUES (9, 'platform', 5, 9, '九成新 ', 26.00, 1.00, 10, NULL, '2026-03-20 23:28:10');
INSERT INTO `book_condition_price` VALUES (10, 'platform', 6, 8, '八成新', 22.00, 2.00, 10, NULL, '2026-03-20 23:29:30');
INSERT INTO `book_condition_price` VALUES (11, 'platform', 7, 8, '八成新', 55.00, 37.50, 10, NULL, '2026-03-20 23:30:46');
INSERT INTO `book_condition_price` VALUES (12, 'user', 6, 8, '', 39.80, 5.00, 1, NULL, '2026-03-20 23:33:01');
INSERT INTO `book_condition_price` VALUES (13, 'user', 7, 10, '', 199.80, 36.00, 1, NULL, '2026-03-20 23:34:17');
INSERT INTO `book_condition_price` VALUES (14, 'user', 8, 8, '', 15.00, 10.00, 1, NULL, '2026-03-20 23:37:25');

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
) ENGINE = InnoDB AUTO_INCREMENT = 129 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of chat_message
-- ----------------------------
INSERT INTO `chat_message` VALUES (117, 8, 1002, 'user', '客服在吗', 'text', 1, '2026-03-20 23:41:01', '2026-03-20 23:41:09');
INSERT INTO `chat_message` VALUES (118, 8, 1001, 'admin', '在的亲亲', 'text', 1, '2026-03-20 23:41:12', '2026-03-20 23:42:00');
INSERT INTO `chat_message` VALUES (119, 8, 1002, 'user', '没事了', 'text', 1, '2026-03-20 23:41:18', '2026-03-20 23:41:26');
INSERT INTO `chat_message` VALUES (120, 8, 1001, 'admin', '好呢', 'text', 1, '2026-03-20 23:41:37', '2026-03-20 23:42:00');
INSERT INTO `chat_message` VALUES (121, 8, 1002, 'user', '嗯嗯', 'text', 1, '2026-03-20 23:41:43', '2026-03-26 08:30:59');
INSERT INTO `chat_message` VALUES (122, 9, 1005, 'admin', '你这个书还在吗', 'text', 1, NULL, '2026-03-26 08:31:07');
INSERT INTO `chat_message` VALUES (123, 10, 1002, 'user', '为什么用户和用户直接还是不行', 'text', 1, NULL, '2026-03-26 08:31:05');
INSERT INTO `chat_message` VALUES (124, 10, 1002, 'user', '为什么我可以和你聊天', 'text', 1, NULL, '2026-03-26 08:31:05');
INSERT INTO `chat_message` VALUES (125, 10, 1002, 'user', '唉 这UI一言难尽', 'text', 1, NULL, '2026-03-26 08:31:05');
INSERT INTO `chat_message` VALUES (126, 10, 1002, 'user', '都不知道谁给谁发的', 'text', 1, NULL, '2026-03-26 08:31:05');
INSERT INTO `chat_message` VALUES (127, 10, 1002, 'user', '顺序还是倒的', 'text', 1, NULL, '2026-03-26 08:31:05');
INSERT INTO `chat_message` VALUES (128, 8, 1002, 'user', '好的', 'text', 1, NULL, '2026-03-26 08:30:59');

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
) ENGINE = InnoDB AUTO_INCREMENT = 11 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of chat_session
-- ----------------------------
INSERT INTO `chat_session` VALUES (8, 1002, 0, 'service', 'active', '好的', '2026-03-21 10:06:34', 0, 0, NULL, NULL, '2026-03-26 08:30:59');
INSERT INTO `chat_session` VALUES (9, 1005, 1002, 'seller', 'active', '你这个书还在吗', '2026-03-21 00:12:12', 0, 0, NULL, NULL, '2026-03-26 08:31:07');
INSERT INTO `chat_session` VALUES (10, 1002, 1005, 'seller', 'active', '顺序还是倒的', '2026-03-21 00:14:17', 0, 0, NULL, NULL, '2026-03-26 08:31:05');

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
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Compact;

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
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '发现-用户帖子' ROW_FORMAT = Compact;

-- ----------------------------
-- Records of discover_post
-- ----------------------------
INSERT INTO `discover_post` VALUES (2, 1002, '静一 发帖', 'http://59.110.64.215:3002/uploads/discover/1774007126297_m65mvofm.jpg', 2, 0, 1, '2026-03-20 19:45:43', '2026-03-20 23:36:04');
INSERT INTO `discover_post` VALUES (3, 1005, '收一本 我自提', 'http://59.110.64.215:3002/uploads/discover/1774020958163_bcdnk8yv.jpg', 0, 1, 1, '2026-03-20 23:35:59', '2026-03-20 23:36:16');
INSERT INTO `discover_post` VALUES (4, 1001, '测试图片功能', 'http://59.110.64.215:3002/uploads/discover/1774022885180_tfc4tq4v.jpg', 0, 0, 1, '2026-03-21 00:08:06', '2026-03-21 00:08:06');

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
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '发现-帖子评论' ROW_FORMAT = Compact;

-- ----------------------------
-- Records of discover_post_comment
-- ----------------------------
INSERT INTO `discover_post_comment` VALUES (2, 3, 1002, NULL, '我这里有，私聊', 1, '2026-03-20 23:36:16');

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
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '发现-帖子点赞' ROW_FORMAT = Compact;

-- ----------------------------
-- Records of discover_post_like
-- ----------------------------
INSERT INTO `discover_post_like` VALUES (3, 2, 1001, '2026-03-20 19:51:52');
INSERT INTO `discover_post_like` VALUES (4, 2, 1005, '2026-03-20 23:36:04');

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
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of faq
-- ----------------------------
INSERT INTO `faq` VALUES (1, '下单与支付', '如何购买二手书？', '在首页或搜索页选择图书后点击“立即购买”，按照提示完成支付即可。', 100, 1, '2026-03-10 11:00:00', '2026-03-10 11:00:00');
INSERT INTO `faq` VALUES (2, '售后与退款', '收到的书籍破损怎么办？', '请在订单详情中发起退款/售后申请并上传实拍照片，客服会在 1 个工作日内处理。', 90, 1, '2026-03-10 11:05:00', '2026-03-10 11:05:00');

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
) ENGINE = InnoDB AUTO_INCREMENT = 12 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of notification
-- ----------------------------
INSERT INTO `notification` VALUES (7, 0, '新咨询工单：TMMZ2DFOHFO827J 发布的图书没有库存', '用户提交了一个新工单：TMMZ2DFOHFO827J', 'ticket', NULL, NULL, '2026-03-20 23:38:43');
INSERT INTO `notification` VALUES (8, 0, '新咨询工单：TMMZ2EGGBUU6I5E 发布的贴子没办法删除', '用户提交了一个新工单：TMMZ2EGGBUU6I5E', 'ticket', NULL, NULL, '2026-03-20 23:39:31');
INSERT INTO `notification` VALUES (9, 0, '新咨询工单：TMMZ2I6RCXK8C6U admin 客服的消息不是及时的', '用户提交了一个新工单：TMMZ2I6RCXK8C6U', 'ticket', NULL, NULL, '2026-03-20 23:42:25');
INSERT INTO `notification` VALUES (10, 0, '新咨询工单：消息 发送人和被发送人的一致', '用户提交了一个新工单，请及时处理', 'ticket', NULL, NULL, '2026-03-21 00:15:32');
INSERT INTO `notification` VALUES (11, 0, '新咨询工单：工单问题', '用户提交了一个新工单，请及时处理', 'ticket', NULL, NULL, '2026-03-21 00:16:07');

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
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of order_items
-- ----------------------------
INSERT INTO `order_items` VALUES (1, 1, 1, 'platform', '数字摄影与摄像', 'https://www0.kfzimg.com/sw/kfz-cos/kfzimg/5126996/ea205f3a1ca80f92_s.jpg', 11.25, 1, 1001, '0000-00-00 00:00:00', '2026-03-20 17:08:15');

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
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of orders
-- ----------------------------
INSERT INTO `orders` VALUES (1, '202603201708056392', 1005, 11.25, 'shipped', '{\"id\":3,\"user_id\":1005,\"name\":\"1\",\"phone\":\"1\",\"province\":\"1\",\"city\":\"1\",\"district\":\"1\",\"detail\":\"1\",\"is_default\":0,\"created_at\":\"0000-00-00 00:00:00\",\"updated_at\":\"2026-03-20T09:08:13.000Z\"}', NULL, '2026-03-20 17:08:17', '2026-03-21 13:02:41', NULL, '0000-00-00 00:00:00', '2026-03-21 13:02:41');

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
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of payment_record
-- ----------------------------
INSERT INTO `payment_record` VALUES (1, 1, '202603201708056392', 1005, 11.25, 'balance', 'success', 'PAY17739976873939990', '2026-03-20 17:08:17', '2026-03-20 17:08:17');

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
) ENGINE = InnoDB AUTO_INCREMENT = 8 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of platform_book
-- ----------------------------
INSERT INTO `platform_book` VALUES (1, 1001, '9787302615439', '数字摄影与摄像', '詹青龙 袁东斌 刘光勇', '清华大学出版社', '2023-08', 1, '计算机,考研', 'onsale', 'https://www0.kfzimg.com/sw/kfz-cos/kfzimg/5126996/ea205f3a1ca80f92_s.jpg', 'https://www0.kfzimg.com/sw/kfz-cos/kfzimg/5126996/ea205f3a1ca80f92_s.jpg,https://www0.kfzimg.com/sw/kfz-cos/kfzimg/5126996/ea205f3a1ca80f92_s.jpg,https://www0.kfzimg.com/sw/kfz-cos/kfzimg/5126996/ea205f3a1ca80f92_s.jpg', '书籍保存完好，无破损无缺页，仅封面有轻微磨损，内页干净无笔记划线。购买后非质量问题不支持退货，请谨慎下单。', 0, '2025-11-18 15:07:51', '2025-11-24 09:51:08');
INSERT INTO `platform_book` VALUES (4, 1001, '9787530216590', '沉默的大多数', ' 王小波', '北京十月文艺出版社', '', 2, '文学艺术', 'onsale', 'http://59.110.64.215:3002/uploads/platform/1774092800070_oicobx85.jpg', '', '王小波杂文精选集，逝世二十周年精装纪念版！特别收入珍贵手稿！集结精粹杂文，全面呈现一位自由思想者的精神世界！——“从话语中，你很少能学到人性，从沉默中却能。”\n【内容简介】\n自从我辈成人以来，所见到的一切全是颠倒着的。在一个喧嚣的话语圈下面，始终有个沉默的大多数。——王小波\n本书收录了王小波的杂文代表作，他以卓越的文采，众醉独醒的姿态对社会道德伦理、国学与新儒家、个体尊严以及小说、艺术等方面进行了酣畅淋漓的剖析，表达了有理有趣的观点。时隔二十年，依然如同清流一般，读来让人沉思，让人捧腹，让人拍案叫绝。王小波说：我活在世上，无非想要明白些道理，遇见些有趣的事。倘能如我所愿，我的一生就算成功。我开始得太晚了，很可能做不成什么，但我总得申明我的态度，所以就有了这本书——为我自己，也代表沉默的大多数。', 0, '0000-00-00 00:00:00', '2026-03-21 19:33:21');
INSERT INTO `platform_book` VALUES (5, 1001, '9787040610536', '习近平新时代中国特色社会主义思想概论', '本书编写组', ' 高等教育出版社', '', 1, '文学艺术', 'onsale', 'http://59.110.64.215:3002/uploads/platform/1774092806416_w7os9drc.jpg', '', '《概论》由导论、17章主体内容和结语构成，全面反映了马克思主义中国化时代化最新成果，反映了新时代伟大实践和伟大变革，反映了学术界共识性研究成果。《概论》坚持遵循教育规律、突出教学导向，注重贴近青年学生认知特征和接受习惯，体现了大中小学思政课的一体化育人要求。教材编写过程中，理论界专家学者和一线中青年骨干教师广泛参与，马克思主义理论研究和建设工程办公室负责具体组织工作。', 0, '0000-00-00 00:00:00', '2026-03-21 19:33:27');
INSERT INTO `platform_book` VALUES (6, 1001, ' 978730202368', '数据结构', ' 严蔚敏,吴伟民', '湖南人民出版社', '', 1, '文学艺术', 'onsale', 'http://59.110.64.215:3002/uploads/platform/1774092816541_kcumlm1x.jpg', '', '《数据结构》（C语言版）是为“数据结构”课程编写的教材，也可作为学习数据结构及其算法的C程序设计的参考教材。本书的前半部分从抽象数据类型的角度讨论各种基本类型的数据结构及其应用；后半部分主要讨论查找和排序的各种实现方法及其综合分析比较。其内容和章节编排与1992年4月出版的《数据结构》（第二版）基本一致，但在本书中更突出了抽象数据类型的概念。全书采用类C语言作为数据结构和算法的描述语言。本书概念表述严谨，逻辑推理严密，语言精炼，用词达意。并有配套出版的《数据结构题集》（C语言版）。既便于教学，又便于自学。 本书可作为计算机类专业或信息类相关专业的本科或专科教材，也可供从事计算机工程与应用工作的科技工作者参考。', 0, '0000-00-00 00:00:00', '2026-03-21 19:33:37');
INSERT INTO `platform_book` VALUES (7, 1001, '9787111532637', '身体从未忘记', ' 李智', '机械工业出版社 ', '', 2, '文学艺术', 'onsale', 'http://59.110.64.215:3002/uploads/platform/1774092833703_ekbd0rk0.jpg', '', '本书是一部杰作。作者充满感情和同理心的深入视角，令人深信今后对心理创伤幸存者的治疗会日益人性化，极大地拓展了自我调控和疗愈的方式，同时也激发了更多关于创伤及其有效治疗方式的研究创新。作者范德考克通过充分呈现他人工作中令人信服的证据，连同他自己的开拓性探索以及在此过程中获取的经验，证实了身体会记录创伤的经历。除此之外，他开发了一套借助瑜伽、运动和戏剧表演的方法，巧妙地将人们的身体和心灵（以及他们的思想和情感）联系起来。这个新鲜观点是美好和令人欢迎的，并为心理治疗界带来了新的可能性。', 0, '0000-00-00 00:00:00', '2026-03-21 19:33:55');

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
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Compact;

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
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of refund
-- ----------------------------
INSERT INTO `refund` VALUES (1, 1, '202603201708056392', 1005, 'refund', '1', 11.25, 'pending', NULL, '2026-03-20 17:08:41', '2026-03-20 17:08:41');

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
  `order_id` bigint(20) DEFAULT NULL COMMENT '关联订单ID',
  `order_no` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL COMMENT '订单编号（可选）',
  `assigned_to` bigint(20) DEFAULT NULL COMMENT '分配给谁',
  `reply` text CHARACTER SET utf8 COLLATE utf8_general_ci COMMENT '处理回复',
  `admin_id` bigint(20) DEFAULT NULL COMMENT '处理人',
  `created_at` datetime DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 10 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of service_ticket
-- ----------------------------
INSERT INTO `service_ticket` VALUES (5, 'TMMZ2DFOHFO827J', 1002, 'consultation', '发布的图书没有库存', '我的图书有很几本 我发现我每次只能提交一本，希望以后可以设置数量。', 'processing', 'high', NULL, NULL, 1001, '亲 你的问题后台已经收到，工程师正在加紧处理哦', 1001, '2026-03-20 23:38:43', '2026-03-20 23:40:50');
INSERT INTO `service_ticket` VALUES (6, 'TMMZ2EGGBUU6I5E', 1005, 'consultation', '发布的贴子没办法删除', '我发布的贴子没办法删除', 'processing', 'normal', NULL, NULL, 1001, '亲亲 你好 马上出来这个问题哦', 1001, '2026-03-20 23:39:31', '2026-03-20 23:40:19');
INSERT INTO `service_ticket` VALUES (7, 'TMMZ2I6RCXK8C6U', 1005, 'consultation', 'admin 客服的消息不是及时的', 'admin 后台的需要处理', 'pending', 'normal', NULL, NULL, NULL, NULL, NULL, '2026-03-20 23:42:25', '2026-03-20 23:42:25');

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
) ENGINE = InnoDB AUTO_INCREMENT = 15 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Compact;

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
INSERT INTO `system_config` VALUES (14, 'role_page_permission', '{\"superAdmin\":[\"/dashboard\",\"/categories\",\"/platform-books\",\"/user-books\",\"/orders\",\"/refunds\",\"/order-stats\",\"/users\",\"/violations\",\"/payments\",\"/withdrawals\",\"/coupons\",\"/announcements\",\"/banners\",\"/discover-posts\",\"/chat-sessions\",\"/tickets\",\"/faq-manage\",\"/system-config\",\"/role-pages\",\"/chat-sessions-manage\"],\"operationAdmin\":[\"/dashboard\",\"/categories\",\"/platform-books\",\"/user-books\",\"/orders\",\"/refunds\",\"/order-stats\",\"/users\",\"/violations\",\"/payments\",\"/withdrawals\",\"/coupons\",\"/announcements\",\"/banners\",\"/discover-posts\",\"/system-config\"],\"customerService\":[\"/dashboard\",\"/chat-sessions\",\"/tickets\",\"/faq-manage\",\"/chat-sessions-manage\"],\"user\":[]}', NULL, '2026-03-20 22:34:46');

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
) ENGINE = InnoDB AUTO_INCREMENT = 1015 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of user
-- ----------------------------
INSERT INTO `user` VALUES (1001, 'admin', '$2b$10$7XIOjLf/9mdyeKsp3vJOjeRGrQKPfK0cd9jdUEd4VNrJunXy1fPf6', '19545696998', 'superAdmin', NULL, 0, 'http://59.110.64.215:3002/uploads/avatar/1774022975138_xr6zyzwk.jpg', '平台', 100, 1, NULL, '2025-11-17 17:32:22', '2026-03-21 00:09:36', '河南工学院', '数字媒体技术');
INSERT INTO `user` VALUES (1002, 'admin1', '$2b$10$Dpew8zO1KeEQHA64tOBizekU2RLDNDk/w28KHLtoH3dxmXFhHEly6', '13333333333', 'user', NULL, 0, 'http://59.110.64.215:3002/uploads/avatar/1774023013168_pqp7wguq.jpg', '吃饱饿了在吃', 100, 1, NULL, '2025-11-17 17:42:32', '2026-03-21 00:10:14', '河南工学院', '计算机应用技术');
INSERT INTO `user` VALUES (1005, 'admin2', '$2b$10$Bh3/3EuyJfs3UEVmf2bk3ukqlAj9.M7GeAIgVCqmBSc0y1RoBIWzS', '17275424776', 'customerService', NULL, 0, 'http://59.110.64.215:3002/uploads/avatar/1774023056959_rrqen2i6.webp', '昵称', 100, 1, NULL, '2025-11-19 15:29:10', '2026-03-21 00:10:58', '', '');
INSERT INTO `user` VALUES (1006, 'liuhaonan', '$2b$10$Krne03n5xEfDY6u2dm.xVOsULYRUG1JOE/G/b/a3z2jwhpoV1tKIS', '18773355531', 'user', NULL, NULL, NULL, NULL, 100, 1, 0, '0000-00-00 00:00:00', '2026-02-15 23:56:13', NULL, NULL);
INSERT INTO `user` VALUES (1014, 'kunkunyu', '$2b$10$KkmrUqqWbDF6CF4/VX61kO3Exka5oqTmazf4kRnmnUvKnOxardILO', '14444444444', NULL, NULL, NULL, NULL, NULL, 100, 1, 0, '0000-00-00 00:00:00', '2026-03-21 19:37:00', NULL, NULL);

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
) ENGINE = InnoDB AUTO_INCREMENT = 9 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of user_book
-- ----------------------------
INSERT INTO `user_book` VALUES (2, 1002, '9787220139291', '克林索尔的最后一个夏天', '[德] 赫尔曼·黑塞', '四川人民出版社', '2025-06', 1, '计算机,考研', 'onsale', 'https://booklibimg.kfzimg.com/data/book_lib_img_v2/isbn/1/d2ea/d2ea4006e9ef5c32910ef63cf457710f_0_1_300_300.jpg', 'https://booklibimg.kfzimg.com/data/book_lib_img_v2/isbn/1/d2ea/d2ea4006e9ef5c32910ef63cf457710f_0_1_300_300.jpg,https://booklibimg.kfzimg.com/data/book_lib_img_v2/isbn/1/d2ea/d2ea4006e9ef5c32910ef63cf457710f_0_1_300_300.jpg,https://booklibimg.kfzimg.com/data/book_lib_img_v2/isbn/1/d2ea/d2ea4006e9ef5c32910ef63cf457710f_0_1_300_300.jpg', '书籍保存完好，无破损无缺页，仅封面有轻微磨损，内页干净无笔记划线。购买后非质量问题不支持退货，请谨慎下单。', 0, '2025-11-20 22:00:27', '2026-03-20 23:35:22');
INSERT INTO `user_book` VALUES (6, 1005, '9787521726473', '小狗钱钱', ' 文燚', '中信出版集团', '', 2, '文学艺术', 'onsale', 'http://59.110.64.215:3002/uploads/book/1774092960485_mnk3fsac.jpg', '', '让孩子和家长共同成长的金钱童话。\n从此拥有财富，开启富足快乐人生。\n你和富足、快乐、自由的人生之间也许就差一本《小狗钱钱》！\n▼内容简介\n欧美财富启蒙读物！\n引导孩子正确认识财富、创造财富的“金钱童话”！\n吉娅是一个普通的12岁女孩，一次偶然的机会，她救助了一只受伤的小狗，并给它取名叫“钱钱”。没想到，钱钱居然是一位深藏不露的理财高手，它改变了吉娅一家人的财富命运……“欧洲理财大师”博多·舍费尔用生动的理财童话，教会你如何从小学会支配金钱，而不是受金钱的支配；如何像富人那样思考，正确地认识和使用金钱；如何进行理财投资，找到积累资产的方法，早日实现财务自由！\n', 0, '0000-00-00 00:00:00', '2026-03-21 19:36:01');
INSERT INTO `user_book` VALUES (7, 1002, '9787513935234', '第二次世界大战史', '(英)利德尔·哈特', '民主与建设出版社', '', 2, '', 'onsale', 'http://59.110.64.215:3002/uploads/book/1774092927453_ci19ke43.jpg', '', '★这是一本第二次世界大战战史，以时间为主线，纵向梳理世界反法西斯战争的潮流起伏、形势发展，横向讲述欧洲、北非、苏德、太平洋等各个战区的重要战事。\n★作者站在一名军事理论家的高度，对参战国的战略决策和战役行动做了透彻讲解与精彩点评，对各国的战争愚行，特别是英国的连连失误更是不吝笔墨严加批判。\n★书中没有拗口的术语和复杂的概念，作者一路大道至简、平铺直序，辅以*到的分析、深刻的反思，甚至辛辣的讽刺。无论是战史小白、对二战有一些了解的进阶读者，还是骨灰级的二战粉丝，都能各取所需，从中汲取营养。\n★机械化战争论和间接路线理论是贯穿全书的两条暗线，几乎在解说各场战役时都得到了体现和运用，因此这本书也是深入理解利德尔·哈特军事思想的重要补充。', 0, '0000-00-00 00:00:00', '2026-03-21 19:35:28');
INSERT INTO `user_book` VALUES (8, 1002, '9787534272523', '查理九世18·地狱温泉的诅咒', 'unknown', 'unknown', '', 3, '', 'onsale', 'http://59.110.64.215:3002/uploads/book/1774092936047_enl6giv3.jpg', '', '《墨多多谜境冒险系列·查理九世18：地狱温泉的诅咒》讲述了：墨多多收到了一封不幸的“诅咒之信”，DODO冒险队跟随信中指引来到温泉乡，想要见证传说中“最恐怖又最美好的奇妙事情”！古怪的温泉旅舍中暗淡无光，镜子中居然照不出人影？打开房门，等待着他们的赫然是……一具棺材！时钟敲响了十二下，如同地狱一般的血红色温泉里伸出一只只青白色的手臂，穿着寿衣的人们挨个爬了上来，白发变青丝，每走一步，他们都更加年轻……所有人都疯狂了，沉浸在美好的青春梦境之中。谁也没注意到，死神已在角落偷偷拉响了梵婀玲。温泉水究竟蕴藏着怎样的巨大能量，它带给人们的是福音还是万劫不复的灾难？隐藏在背后的是美好的希望，还是人类可笑的欲望？竖起耳朵，听，这是来自地狱的呼唤声！', 0, '0000-00-00 00:00:00', '2026-03-21 19:35:37');

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
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Compact;

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
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Compact;

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
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Compact;

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
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE utf8_general_ci ROW_FORMAT = Compact;

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
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE utf8_general_ci ROW_FORMAT = Compact;

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
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE utf8_general_ci ROW_FORMAT = Compact;

SET FOREIGN_KEY_CHECKS = 1;
