const TradeCode = require("../models/TradeCode");
const crypto = require("crypto");

// This controller handles generating and using trade codes
exports.generateTradeCode = async (req, res) => {
	const code = "TRD-" + crypto.randomBytes(4).toString("hex").toUpperCase();
	const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
	await TradeCode.create({ code, user: req.user._id, expiresAt });
	res.json({ code, expiresAt });
};

exports.useTradeCode = async (req, res) => {
	const { code } = req.body;
	const tradeCode = await TradeCode.findOne({ code }).populate("user");
	if (!tradeCode || tradeCode.expiresAt < new Date()) {
		return res.status(400).json({ message: "Invalid or expired code" });
	}
	res.json({ user: tradeCode.user });
};
