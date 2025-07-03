const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Name is required"],
			trim: true,
			maxlength: [50, "Name cannot be more than 50 characters"],
		},
		email: {
			type: String,
			required: true,
			unique: true,
			validate: {
				validator: validator.isEmail,
				message: "Please enter a valid email",
			},
		},
		password: {
			type: String,
			required: [true, "Password is required"],
			minlength: [6, "Password must be at least 6 characters"],
		},
		currentLocation: {
			type: {
				type: String,
				enum: ["Point"],
				default: "Point",
			},
			coordinates: {
				type: [Number], // [longitude, latitude]
				default: undefined,
			},
		},
		favorites: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "CulturalSite",
			},
		],
		visitedSites: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "CulturalSite",
			},
		],
		inventory: [
			{
				site: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "CulturalSite",
					required: true,
				},
				count: { type: Number, default: 1 },
				caughtAt: { type: Date, default: Date.now },
				tradeHistory: [
					{
						to: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
						date: { type: Date, default: Date.now },
						type: { type: String, enum: ["sent", "received"] },
					},
				],
			},
		],
	},
	{
		timestamps: true,
	}
);

// Hash password before saving
userSchema.pre("save", async function (next) {
	if (!this.isModified("password")) return next();

	try {
		const salt = await bcrypt.genSalt(10);
		this.password = await bcrypt.hash(this.password, salt);
		next();
	} catch (error) {
		next(error);
	}
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
	return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
