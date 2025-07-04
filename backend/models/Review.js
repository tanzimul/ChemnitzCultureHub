const mongoose = require("mongoose");

/**
 * @model   Review
 * @desc    Represents a user review for a cultural site
 */
const reviewSchema = new mongoose.Schema(
	{
		user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
		site: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "CulturalSite",
			required: true,
		},
		rating: { type: Number, min: 1, max: 5, required: true },
		comment: { type: String, required: true },
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
