const express = require("express");
const router = express.Router();
const regionHandler = require("../router_handler/region");

router.get("/list", regionHandler.getList);
router.get("/children", regionHandler.getChildren);

module.exports = router;
