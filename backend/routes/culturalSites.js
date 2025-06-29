const express = require("express");
const router = express.Router();
const CulturalSite = require("../models/CulturalSite");
const auth = require("../middleware/auth");

router.get("/", auth, async (req, res) => {
	try {
		console.log("Fetching cultural sites...");
		const sites = await CulturalSite.find();
		console.log("Cultural sites fetched:", sites.length);
		res.json(sites);
	} catch (error) {
		console.error("Error fetching cultural sites:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

router.get("/:id", auth, async (req, res) => {
	try {
		const site = await CulturalSite.findById(req.params.id);
		if (!site) return res.status(404).json({ error: "Not found" });
		res.json(site);
	} catch (error) {
		console.error("Error fetching cultural site by ID:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

module.exports = router;
