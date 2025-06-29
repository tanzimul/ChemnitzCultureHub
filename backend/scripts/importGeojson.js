require("dotenv").config();
const fs = require("fs");
const mongoose = require("mongoose");
const CulturalSite = require("../models/CulturalSite");
const geojson = JSON.parse(fs.readFileSync(__dirname + "/Chemnitz.geojson"));

function getCategory(props) {
	// Priority: explicit category, tourism, amenity, artwork_type, museum, gallery, theatre, etc.
	return (
		props.category ||
		props.Category ||
		props.tourism || // museum, artwork, gallery, etc.
		props.amenity || // restaurant, theatre, etc.
		props.artwork_type || // sculpture, mural, etc.
		props.museum || // e.g. "railway", "history"
		props.gallery ||
		props.theatre ||
		"Uncategorized"
	);
}

async function importData() {
	await mongoose.connect(process.env.MONGODB_URI);
	const entries = geojson.features
		.filter(
			(f) => f.properties && f.geometry && Array.isArray(f.geometry.coordinates)
		)
		.map((f) => ({
			name: f.properties.name || f.properties.Name || "Unknown",
			category: getCategory(f.properties),
			description: f.properties.description || f.properties.Description || "",
			location: { type: "Point", coordinates: f.geometry.coordinates },
			properties: f.properties,
		}));
	await CulturalSite.insertMany(entries);
	console.log("Data Imported");
	mongoose.disconnect();
}

importData();
