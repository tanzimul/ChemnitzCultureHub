const mongoose = require("mongoose");
const TradeCodeSchema = new mongoose.Schema({
	code: { type: String, unique: true },
	user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
	expiresAt: { type: Date, index: { expires: 0 } }, // TTL index
});
module.exports = mongoose.model("TradeCode", TradeCodeSchema);
