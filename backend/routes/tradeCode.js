const express = require("express");
const router = express.Router();
const {
	generateTradeCode,
	useTradeCode,
} = require("../controllers/tradeCodeController");
const auth = require("../middleware/auth");

router.post("/generate", auth, generateTradeCode);
router.post("/use", auth, useTradeCode);

module.exports = router;
