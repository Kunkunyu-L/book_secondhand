const express = require("express");
const router = express.Router();
const handler = require("../router_handler/discover");

// 帖子列表（公开）
router.get("/posts", handler.getPosts);
// 我发布的帖子（需认证）
router.get("/my-posts", handler.getMyPosts);
// 发帖（需认证）
router.post("/posts", handler.createPost);
// 点赞/取消（需认证）
router.post("/posts/:id/like", handler.toggleLike);
// 是否已点赞（需认证）
router.get("/posts/:id/liked", handler.checkLiked);
// 评论列表（公开）
router.get("/posts/:id/comments", handler.getComments);
// 发表评论（需认证）
router.post("/posts/:id/comments", handler.createComment);

// 删除我发布的帖子（需登录）
// 约定：前端以 body 传 { id }
router.delete("/posts", handler.deleteMyPost);

module.exports = router;
