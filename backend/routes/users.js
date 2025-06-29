const express = require("express");
const {
	updateProfile,
	addFavoriteLocation,
	removeFavoriteLocation,
	getFavoriteLocations,
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

module.exports = router;
