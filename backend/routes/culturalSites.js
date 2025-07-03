const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
	getAllCulturalSites,
	getCulturalSiteById,
} = require("../controllers/culturalSitesController");

router.get("/", auth, getAllCulturalSites);
router.get("/:id", auth, getCulturalSiteById);

module.exports = router;
