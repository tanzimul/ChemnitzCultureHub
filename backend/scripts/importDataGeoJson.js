require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const CulturalSite = require("../models/CulturalSite");

// List of allowed categories (OSM tag values)
const allowedCategories = [
	"museum",
	"gallery",
	"artwork",
	"attraction",
	"monument",
	"memorial",
	"library",
	"theatre",
	"arts_centre",
	"bus_station",
	"ferry_terminal",
	"station",
	"tram_stop",
	"bus_stop",
	"park",
	"parking",
];

// OSM keys that may contain a category value
const categoryKeys = [
	"tourism",
	"amenity",
	"historic",
	"leisure",
	"artwork_type",
	"public_transport",
];

// Determine the category for a given tags object
function getCategory(tags) {
	for (const key of categoryKeys) {
		if (tags[key] && allowedCategories.includes(tags[key])) {
			return tags[key];
		}
	}
	// If artwork_type exists, treat as artwork
	if (tags.artwork_type) return "artwork";
	// If amenity is "parking", treat as parking
	if (tags.amenity === "parking") return "parking";
	return null;
}

function extractEntriesFromGeoJSON(filePath) {
	const geojson = JSON.parse(fs.readFileSync(filePath));
	const elements = Array.isArray(geojson.elements) ? geojson.elements : [];

	return elements
		.filter(
			(el) =>
				el.tags && typeof el.lat === "number" && typeof el.lon === "number"
		)
		.map((el) => {
			const tags = el.tags;
			const category = getCategory(tags);

			return {
				name: tags.name || "Unknown",
				category,
				description: tags.description || "",
				location: {
					type: "Point",
					coordinates: [el.lon, el.lat],
				},
				properties: tags,
			};
		})
		.filter(
			(entry) => entry.category && allowedCategories.includes(entry.category)
		);
}

async function importData() {
	await mongoose.connect(process.env.MONGODB_URI);
	console.log("✅ Connected to MongoDB");

	const file = path.join(__dirname, "data.geoJson");
	console.log(`📂 Processing ${file}`);
	const entries = extractEntriesFromGeoJSON(file);

	let inserted = 0;
	let skipped = 0;

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

	console.log(`🎉 Import complete: ${inserted} inserted, ${skipped} skipped.`);
	await mongoose.disconnect();
}

importData().catch((err) => {
	console.error("❌ Error importing data:", err);
});
