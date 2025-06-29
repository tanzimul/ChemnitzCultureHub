require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const CulturalSite = require("../models/CulturalSite");

function getCategory(props) {
	return (
		props.category ||
		props.Category ||
		props.tourism ||
		props.amenity ||
		props.artwork_type ||
		props.museum ||
		props.gallery ||
		props.theatre ||
		"Uncategorized"
	);
}

function extractEntriesFromGeoJSON(filePath) {
	const geojson = JSON.parse(fs.readFileSync(filePath));
	return geojson.features
		.filter(
			(f) => f.properties && f.geometry && Array.isArray(f.geometry.coordinates)
		)
		.map((f) => ({
			name: f.properties.name || f.properties.Name || "Unknown",
			category: getCategory(f.properties),
			description: f.properties.description || f.properties.Description || "",
			location: {
				type: "Point",
				coordinates: f.geometry.coordinates,
			},
			properties: f.properties,
		}));
}

async function importData() {
	await mongoose.connect(process.env.MONGODB_URI);
	console.log("✅ Connected to MongoDB");

	const files = [
		path.join(__dirname, "Chemnitz.geojson"),
		path.join(__dirname, "export.geojson"),
	];

	let inserted = 0;
	let skipped = 0;

	for (const file of files) {
		console.log(`📂 Processing ${file}`);
		const entries = extractEntriesFromGeoJSON(file);

		for (const entry of entries) {
			const exists = await CulturalSite.findOne({
				name: entry.name,
				category: entry.category,
				"location.coordinates": entry.location.coordinates,
			});

			if (!exists) {
				await CulturalSite.create(entry);
				inserted++;
			} else {
				skipped++;
			}
		}
	}

	console.log(`🎉 Import complete: ${inserted} inserted, ${skipped} skipped.`);
	await mongoose.disconnect();
}

importData().catch((err) => {
	console.error("❌ Error importing data:", err);
});
