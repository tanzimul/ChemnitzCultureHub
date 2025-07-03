const mongoose = require("mongoose");

/**
 * @model   CulturalSite
 * @desc    Represents a cultural site in Chemnitz (museum, artwork, theatre, restaurant, etc.)
 */
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
