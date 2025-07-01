const express = require("express");
const {
	addReview,
	getReviewsForSite,
} = require("../controllers/reviewController");
const auth = require("../middleware/auth");
const router = express.Router();

router.post("/", auth, addReview); // POST /api/reviews
router.get("/:siteId", getReviewsForSite); // GET /api/reviews/:siteId

module.exports = router;
