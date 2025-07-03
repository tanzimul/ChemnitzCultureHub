const CulturalSite = require("../models/CulturalSite");

/**
 * @route   GET /api/cultural-sites
 * @desc    Get all cultural sites
 * @access  Private
 */
exports.getAllCulturalSites = async (req, res) => {
	try {
		const sites = await CulturalSite.find({
			name: { $nin: ["Unknown", "unknown", "Uncategorized", "uncategorized"] },
			$or: [
				{ category: { $exists: false } },
				{
					category: {
						$nin: ["Unknown", "unknown", "Uncategorized", "uncategorized", ""],
					},
				},
			],
		});
		res.json(sites);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

/**
 * @route   GET /api/cultural-sites/:id
 * @desc    Get a cultural site by ID
 * @access  Private
 */
exports.getCulturalSiteById = async (req, res) => {
	try {
		const site = await CulturalSite.findById(req.params.id);
		if (!site) return res.status(404).json({ error: "Not found" });
		res.json(site);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};
