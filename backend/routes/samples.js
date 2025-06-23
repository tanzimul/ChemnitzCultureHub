const express = require("express");
const {
	getAllSamples,
	getSampleById,
	createSample,
	updateSample,
	deleteSample,
	getUserSamples,
} = require("../controllers/sampleController");
const auth = require("../middleware/auth");

const router = express.Router();

// @route   GET /api/samples
// @desc    Get all public samples
// @access  Public
router.get("/", getAllSamples);

// @route   GET /api/samples/my
// @desc    Get user's samples
// @access  Private
router.get("/my", auth, getUserSamples);

// @route   GET /api/samples/:id
// @desc    Get sample by ID
// @access  Public
router.get("/:id", getSampleById);

// @route   POST /api/samples
// @desc    Create sample
// @access  Private
router.post("/", auth, createSample);

// @route   PUT /api/samples/:id
// @desc    Update sample
// @access  Private
router.put("/:id", auth, updateSample);

// @route   DELETE /api/samples/:id
// @desc    Delete sample
// @access  Private
router.delete("/:id", auth, deleteSample);

module.exports = router;
