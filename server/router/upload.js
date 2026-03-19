const express = require("express");
const router = express.Router();
const uploadHandler = require("../router_handler/upload");

// 图片上传，query/body 支持 type: avatar|book|banner|category|logo|discover|platform|other
router.post("/image", uploadHandler.uploadImage);

// 文件上传（图片+文档 pdf/doc/docx/xls/xlsx），query/body 支持 type
router.post("/file", uploadHandler.uploadFile);

module.exports = router;
