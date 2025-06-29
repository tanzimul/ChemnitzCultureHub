const mongoose = require("mongoose");
const culturalSiteSchema = new mongoose.Schema({
	name: String,
	category: String,
	description: String,
	location: {
		type: { type: String, enum: ["Point"], required: true },
		coordinates: { type: [Number], required: true },
	},
	properties: {},
});

culturalSiteSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("CulturalSite", culturalSiteSchema);
