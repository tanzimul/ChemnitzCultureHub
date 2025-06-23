const Sample = require("../models/Sample");

// Get All Samples (with pagination and filtering)
exports.getAllSamples = async (req, res) => {
	try {
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;
		const skip = (page - 1) * limit;
		const category = req.query.category;
		const search = req.query.search;

		// Build query
		let query = { isPublic: true };

		if (category) {
			query.category = category;
		}

		if (search) {
			query.$or = [
				{ title: { $regex: search, $options: "i" } },
				{ description: { $regex: search, $options: "i" } },
			];
		}

		const samples = await Sample.find(query)
			.populate("createdBy", "name email")
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit);

		const total = await Sample.countDocuments(query);

		res.json({
			samples,
			pagination: {
				current: page,
				pages: Math.ceil(total / limit),
				total,
			},
		});
	} catch (error) {
		console.error("Get samples error:", error);
		res.status(500).json({ message: "Server error" });
	}
};

// Get Sample by ID
exports.getSampleById = async (req, res) => {
	try {
		const sample = await Sample.findById(req.params.id).populate(
			"createdBy",
			"name email"
		);

		if (!sample) {
			return res.status(404).json({ message: "Sample not found" });
		}

		res.json(sample);
	} catch (error) {
		console.error("Get sample error:", error);
		res.status(500).json({ message: "Server error" });
	}
};

// Create Sample
exports.createSample = async (req, res) => {
	try {
		const { title, description, category, location, isPublic } = req.body;

		const sample = new Sample({
			title,
			description,
			category,
			location,
			isPublic,
			createdBy: req.user._id,
		});

		await sample.save();
		await sample.populate("createdBy", "name email");

		res.status(201).json({
			message: "Sample created successfully",
			sample,
		});
	} catch (error) {
		console.error("Create sample error:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// Update Sample
exports.updateSample = async (req, res) => {
	try {
		const { title, description, category, location, isPublic } = req.body;
		const sampleId = req.params.id;

		const sample = await Sample.findById(sampleId);

		if (!sample) {
			return res.status(404).json({ message: "Sample not found" });
		}

		// Check if user owns the sample
		if (sample.createdBy.toString() !== req.user._id.toString()) {
			return res
				.status(403)
				.json({ message: "Not authorized to update this sample" });
		}

		const updatedSample = await Sample.findByIdAndUpdate(
			sampleId,
			{ title, description, category, location, isPublic },
			{ new: true, runValidators: true }
		).populate("createdBy", "name email");

		res.json({
			message: "Sample updated successfully",
			sample: updatedSample,
		});
	} catch (error) {
		console.error("Update sample error:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// Delete Sample
exports.deleteSample = async (req, res) => {
	try {
		const sampleId = req.params.id;
		const sample = await Sample.findById(sampleId);

		if (!sample) {
			return res.status(404).json({ message: "Sample not found" });
		}

		// Check if user owns the sample
		if (sample.createdBy.toString() !== req.user._id.toString()) {
			return res
				.status(403)
				.json({ message: "Not authorized to delete this sample" });
		}

		await Sample.findByIdAndDelete(sampleId);

		res.json({ message: "Sample deleted successfully" });
	} catch (error) {
		console.error("Delete sample error:", error);
		res.status(500).json({ message: "Server error" });
	}
};

// Get User's Samples
exports.getUserSamples = async (req, res) => {
	try {
		const samples = await Sample.find({ createdBy: req.user._id }).sort({
			createdAt: -1,
		});

		res.json({ samples });
	} catch (error) {
		console.error("Get user samples error:", error);
		res.status(500).json({ message: "Server error" });
	}
};
