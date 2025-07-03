const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
	getAllCulturalSites,
	getCulturalSiteById,
} = require("../controllers/culturalSitesController");

/**
 * @route   GET /api/cultural-sites
 * @desc    Get all cultural sites
 * @access  Private
 */
router.get("/", auth, getAllCulturalSites);

/**
 * @route   GET /api/cultural-sites/:id
 * @desc    Get a cultural site by ID
 * @access  Private
 */
router.get("/:id", auth, getCulturalSiteById);

module.exports = router;
