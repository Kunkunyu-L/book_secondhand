const express = require("express");
const router = express.Router();
const chatHandler = require("../router_handler/chat");

// 聊天 REST API（需认证）
router.get("/sessions", chatHandler.getSessions);
router.get("/messages", chatHandler.getMessages);
router.post("/session", chatHandler.createSession);

module.exports = router;
