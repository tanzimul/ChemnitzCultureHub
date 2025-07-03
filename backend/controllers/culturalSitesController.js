const CulturalSite = require("../models/CulturalSite");

// Get all cultural sites
exports.getAllCulturalSites = async (req, res) => {
	try {
		const sites = await CulturalSite.find();
		console.log("Cultural sites fetched:", sites.length);
		res.json(sites);
	} catch (error) {
		console.error("Error fetching cultural sites:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// Get a cultural site by ID
exports.getCulturalSiteById = async (req, res) => {
	try {
		const site = await CulturalSite.findById(req.params.id);
		if (!site) return res.status(404).json({ error: "Not found" });
		res.json(site);
	} catch (error) {
		console.error("Error fetching cultural site by ID:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};
