const express = require("express");
const {
	updateProfile,
	addFavoriteLocation,
	removeFavoriteLocation,
	getFavoriteLocations,
	updateLocation,
	getMe,
	deleteMe,
	getUserStats,
	collectAndGetVisitedSites,
	catchSite,
	tradeSite,
} = require("../controllers/userController");
const auth = require("../middleware/auth");

const router = express.Router();

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put("/profile", auth, updateProfile);

// @route   GET /api/users/favorites
// @desc    Get user's favorite locations
// @access  Private
router.get("/favorites", auth, getFavoriteLocations);

// @route   POST /api/users/favorites
// @desc    Add favorite location
// @access  Private
router.post("/favorites", auth, addFavoriteLocation);

// @route   DELETE /api/users/favorites/:locationId
// @desc    Remove favorite location
// @access  Private
router.delete("/favorites/:id", auth, removeFavoriteLocation);

// @route   PUT /api/users/location
// @desc    Update user's current location
// @access  Private
router.put("/location", auth, updateLocation);

// @route   GET /api/users/me
// @desc    Get user's data
// @access  Private
router.get("/me", auth, getMe);

// @route   DELETE /api/users/me
// @desc    Delete user profile
// @access  Private
router.delete("/me", auth, deleteMe);

// @route   GET /api/users/me/stats
// @desc    Get user's stats (favorites, visited, inventory)
// @access  Private
router.get("/me/stats", auth, getUserStats);

// @route   GET /api/users/visited-sites
// @desc    Get user's visited cultural sites
// @access  Private
router.get("/visited-sites", auth, collectAndGetVisitedSites);

// @route   POST /api/users/catch-site
// @desc    Catch a cultural site
// @access  Private
router.post("/catch-site", auth, catchSite);

// @route   POST /api/users/trade-site
// @desc    Trade a cultural site
// @access  Private
router.post("/trade-site", auth, tradeSite);

module.exports = router;
