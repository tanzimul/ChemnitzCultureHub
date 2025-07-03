const express = require("express");
const {
	addReview,
	getReviewsForSite,
} = require("../controllers/reviewController");
const auth = require("../middleware/auth");
const router = express.Router();

/**
 * @route   POST /api/review
 * @desc    Add a review for a cultural site
 * @access  Private
 */
router.post("/", auth, addReview);

/**
 * @route   GET /api/review/:siteId
 * @desc    Get all reviews for a specific cultural site
 * @access  Public
 */
router.get("/:siteId", getReviewsForSite);

module.exports = router;
