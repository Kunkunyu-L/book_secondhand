const express = require("express");
const router = express.Router();
const publishHandler = require("../router_handler/publish");

// 发布图书（用户卖书）
router.post("/book", publishHandler.publishBook);

// 获取我发布的图书
router.get("/mybooks", publishHandler.getMyBooks);

// 更新图书状态（上架/下架）
router.put("/book/status", publishHandler.updateBookStatus);

// 删除图书
router.delete("/book", publishHandler.deleteBook);

module.exports = router;
