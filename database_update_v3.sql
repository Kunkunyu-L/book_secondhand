-- ============================================================
-- 二手书交易系统 - 数据库更新 V3
-- 内容管理 + 客服管理 + 系统设置 + 实时聊天
-- 执行前请先备份数据库！
-- ============================================================

-- ==================== 一、内容管理 ====================

-- 1. 公告表
CREATE TABLE IF NOT EXISTS `announcement` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL COMMENT '标题',
  `content` text COMMENT '内容',
  `type` enum('notice','activity','system') NOT NULL DEFAULT 'notice' COMMENT '类型',
  `status` tinyint(1) DEFAULT 1 COMMENT '1=发布 0=草稿',
  `sort` int(11) DEFAULT 0 COMMENT '排序',
  `admin_id` bigint(20) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='公告表';

-- 2. 帮助文档表
CREATE TABLE IF NOT EXISTS `help_article` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL COMMENT '标题',
  `content` text COMMENT '正文(HTML)',
  `category` enum('guide','refund','faq','rule') NOT NULL DEFAULT 'guide' COMMENT '分类',
  `sort` int(11) DEFAULT 0 COMMENT '排序',
  `status` tinyint(1) DEFAULT 1 COMMENT '1=发布 0=草稿',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='帮助文档表';

-- 3. 轮播图表
CREATE TABLE IF NOT EXISTS `banner` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `image_url` varchar(500) NOT NULL COMMENT '图片地址',
  `link_url` varchar(500) DEFAULT '' COMMENT '跳转链接',
  `title` varchar(200) DEFAULT '' COMMENT '标题描述',
  `sort` int(11) DEFAULT 0 COMMENT '展示顺序',
  `status` tinyint(1) DEFAULT 1 COMMENT '1=显示 0=隐藏',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='轮播图表';

-- ==================== 二、客服/聊天系统 ====================

-- 4. 聊天会话表
CREATE TABLE IF NOT EXISTS `chat_session` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL COMMENT '发起用户ID',
  `target_id` bigint(20) NOT NULL COMMENT '目标ID(卖家/客服)',
  `target_type` enum('seller','platform','service') NOT NULL DEFAULT 'service' COMMENT '会话类型',
  `status` enum('active','closed') DEFAULT 'active',
  `last_message` varchar(500) DEFAULT '' COMMENT '最后一条消息',
  `last_message_time` datetime DEFAULT NULL,
  `unread_user` int(11) DEFAULT 0 COMMENT '用户未读数',
  `unread_target` int(11) DEFAULT 0 COMMENT '目标方未读数',
  `assigned_service` bigint(20) DEFAULT NULL COMMENT '分配的客服ID',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_target` (`target_id`, `target_type`),
  KEY `idx_service` (`assigned_service`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='聊天会话表';

-- 5. 聊天消息表
CREATE TABLE IF NOT EXISTS `chat_message` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `session_id` bigint(20) NOT NULL COMMENT '会话ID',
  `sender_id` bigint(20) NOT NULL COMMENT '发送者ID',
  `sender_role` enum('user','seller','admin','service') NOT NULL DEFAULT 'user' COMMENT '发送者角色',
  `content` text NOT NULL COMMENT '消息内容',
  `msg_type` enum('text','image','system') NOT NULL DEFAULT 'text' COMMENT '消息类型',
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_session` (`session_id`),
  KEY `idx_sender` (`sender_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='聊天消息表';

-- 6. 客服工单表
CREATE TABLE IF NOT EXISTS `service_ticket` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `ticket_no` varchar(30) DEFAULT NULL COMMENT '工单编号',
  `user_id` bigint(20) NOT NULL COMMENT '用户ID',
  `type` enum('consultation','complaint','suggestion','other') NOT NULL DEFAULT 'consultation',
  `title` varchar(200) NOT NULL,
  `content` text COMMENT '描述',
  `status` enum('pending','processing','resolved','closed') DEFAULT 'pending',
  `priority` enum('low','normal','high','urgent') DEFAULT 'normal',
  `assigned_to` bigint(20) DEFAULT NULL COMMENT '分配给谁',
  `reply` text COMMENT '处理回复',
  `admin_id` bigint(20) DEFAULT NULL COMMENT '处理人',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_assigned` (`assigned_to`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='客服工单表';

-- 7. 投诉举报表
CREATE TABLE IF NOT EXISTS `complaint` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL COMMENT '举报人',
  `target_type` enum('book','order','user') NOT NULL COMMENT '举报目标类型',
  `target_id` bigint(20) NOT NULL COMMENT '目标ID',
  `reason` varchar(100) NOT NULL COMMENT '举报原因分类',
  `description` text COMMENT '详细描述',
  `evidence_imgs` varchar(2000) DEFAULT '' COMMENT '证据图片(逗号分隔)',
  `status` enum('pending','processing','resolved','rejected') DEFAULT 'pending',
  `result` varchar(500) DEFAULT NULL COMMENT '处理结果',
  `admin_id` bigint(20) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_target` (`target_type`, `target_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='投诉举报表';

-- 8. FAQ分类表
CREATE TABLE IF NOT EXISTS `faq_category` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `sort` int(11) DEFAULT 0,
  `status` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='FAQ分类表';

-- 9. FAQ表
CREATE TABLE IF NOT EXISTS `faq` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `category_id` bigint(20) DEFAULT NULL,
  `question` varchar(500) NOT NULL,
  `answer` text NOT NULL,
  `sort` int(11) DEFAULT 0,
  `status` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='常见问题表';

-- 10. 客服话术分类
CREATE TABLE IF NOT EXISTS `quick_reply_category` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `sort` int(11) DEFAULT 0,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='话术分类表';

-- 11. 客服话术表
CREATE TABLE IF NOT EXISTS `quick_reply` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `category_id` bigint(20) DEFAULT NULL,
  `title` varchar(200) NOT NULL COMMENT '标题/关键词',
  `content` text NOT NULL COMMENT '话术内容',
  `sort` int(11) DEFAULT 0,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='客服话术表';

-- ==================== 三、系统设置 ====================

-- 12. 系统角色表
CREATE TABLE IF NOT EXISTS `admin_role` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL COMMENT '角色名',
  `description` varchar(200) DEFAULT '',
  `permissions` json DEFAULT NULL COMMENT '权限列表JSON',
  `status` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统角色表';

-- 13. 系统配置表
CREATE TABLE IF NOT EXISTS `system_config` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `config_key` varchar(100) NOT NULL COMMENT '配置键',
  `config_value` text COMMENT '配置值',
  `description` varchar(200) DEFAULT '' COMMENT '说明',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_key` (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统配置表';

-- 14. 通知模板表
CREATE TABLE IF NOT EXISTS `notification_template` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL COMMENT '模板名称',
  `type` enum('sms','email','in_app') NOT NULL DEFAULT 'in_app',
  `subject` varchar(200) DEFAULT '' COMMENT '标题/主题',
  `content` text COMMENT '模板内容',
  `variables` varchar(500) DEFAULT '' COMMENT '可用变量说明',
  `status` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='通知模板表';

-- 15. 站内通知表
CREATE TABLE IF NOT EXISTS `notification` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL COMMENT '接收用户(0=全部)',
  `title` varchar(200) NOT NULL,
  `content` text,
  `type` enum('system','order','chat','promotion') DEFAULT 'system',
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`, `is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='站内通知表';

-- ==================== 四、给user表添加角色相关字段 ====================

-- 添加客服相关字段(如果不存在)
ALTER TABLE `user` ADD COLUMN IF NOT EXISTS `role_id` bigint(20) DEFAULT NULL COMMENT '关联角色ID' AFTER `role`;
ALTER TABLE `user` ADD COLUMN IF NOT EXISTS `is_service` tinyint(1) DEFAULT 0 COMMENT '是否客服' AFTER `role_id`;
ALTER TABLE `user` ADD COLUMN IF NOT EXISTS `service_max_sessions` int(11) DEFAULT 10 COMMENT '客服最大接待量' AFTER `is_service`;

-- ==================== 五、初始化默认配置 ====================

INSERT IGNORE INTO `system_config` (`config_key`, `config_value`, `description`) VALUES
('site_name', '二手书交易平台', '网站名称'),
('site_logo', '', '网站LOGO'),
('service_phone', '400-000-0000', '客服电话'),
('icp_number', '', 'ICP备案号'),
('site_description', '专业的二手书交易平台', '平台简介'),
('sms_enabled', '0', '短信通知开关'),
('email_enabled', '0', '邮件通知开关');

-- 初始化默认角色
INSERT IGNORE INTO `admin_role` (`id`, `name`, `description`, `permissions`) VALUES
(1, '超级管理员', '拥有所有权限', '["*"]'),
(2, '运营管理员', '内容和订单管理', '["dashboard","books","orders","content"]'),
(3, '客服人员', '客服相关功能', '["service","chat"]');
