const Review = require("../models/Review");
const User = require("../models/User");

/**
 * @route   POST /api/review
 * @desc    Add a review for a cultural site
 * @access  Private
 */
exports.addReview = async (req, res) => {
	try {
		const { site, rating, comment } = req.body;
		const userId = req.user._id;

		// Only allow reviews for visited sites
		const userDoc = await User.findById(userId);
		if (!userDoc.visitedSites.map((id) => id.toString()).includes(site)) {
			return res
				.status(403)
				.json({ message: "You can only review visited sites." });
		}

		// Prevent duplicate reviews
		const existing = await Review.findOne({ user: userId, site });
		if (existing) {
			return res
				.status(400)
				.json({ message: "You have already reviewed this site." });
		}

		const review = await Review.create({ user: userId, site, rating, comment });
		res.status(201).json(review);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

/**
 * @route   GET /api/review/:siteId
 * @desc    Get all reviews for a specific cultural site
 * @access  Public
 */
exports.getReviewsForSite = async (req, res) => {
	try {
		const reviews = await Review.find({ site: req.params.siteId }).populate(
			"user",
			"name"
		);
		res.json(reviews);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};
