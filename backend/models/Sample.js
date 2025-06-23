const mongoose = require("mongoose");

const sampleSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: [true, "Title is required"],
			trim: true,
			maxlength: [100, "Title cannot be more than 100 characters"],
		},
		description: {
			type: String,
			required: [true, "Description is required"],
			trim: true,
			maxlength: [500, "Description cannot be more than 500 characters"],
		},
		category: {
			type: String,
			required: [true, "Category is required"],
			enum: ["Culture", "History", "Art", "Music", "Food", "Other"],
			default: "Other",
		},
		location: {
			type: String,
			trim: true,
		},
		isPublic: {
			type: Boolean,
			default: true,
		},
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model("Sample", sampleSchema);
