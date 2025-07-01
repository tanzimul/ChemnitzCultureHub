const User = require("../models/User");
const CulturalSite = require("../models/CulturalSite");

// Update User Profile
exports.updateProfile = async (req, res) => {
	try {
		const { name, email } = req.body;
		const userId = req.user._id;

		// Check if email is already taken by another user
		if (email && email !== req.user.email) {
			const existingUser = await User.findOne({ email, _id: { $ne: userId } });
			if (existingUser) {
				return res.status(400).json({ message: "Email already taken" });
			}
		}

		const updatedUser = await User.findByIdAndUpdate(
			userId,
			{ name, email },
			{ new: true, runValidators: true }
		).select("-password");

		res.json({
			message: "Profile updated successfully",
			user: updatedUser,
		});
	} catch (error) {
		console.error("Update profile error:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// Add Favorite Location
exports.addFavoriteLocation = async (req, res) => {
	try {
		const { siteId } = req.body;
		const userId = req.user._id;
		const user = await User.findById(userId);

		// Check for duplicate
		if (user.favorites.some((fav) => fav.toString() === siteId)) {
			return res
				.status(400)
				.json({ message: "This site is already in your favorite list." });
		}

		user.favorites.push(siteId);
		await user.save();
		await user.populate("favorites");
		res.json({
			message: "Favorite location added successfully",
			favorites: user.favorites,
		});
	} catch (error) {
		console.error("Add favorite location error:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// Remove Favorite Location
exports.removeFavoriteLocation = async (req, res) => {
	try {
		const siteId = req.params.id;
		const user = await User.findById(req.user._id);
		//console.log(user.favorites, "User's favorites before removal");
		if (!user.favorites) user.favorites = [];
		//user.favorites = user.favorites.filter((fav) => fav._id.toString() !== id);
		user.favorites = user.favorites.filter(
			(favId) => favId.toString() !== siteId.toString()
		);
		await user.save();
		await user.populate("favorites");
		res.json({
			message: "Favorite location removed successfully",
			favorites: user.favorites,
		});
	} catch (error) {
		console.error("Remove favorite location error:", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// Get User's Favorite Locations
exports.getFavoriteLocations = async (req, res) => {
	try {
		//const user = await User.findById(req.user._id);
		const user = await User.findById(req.user._id).populate("favorites");
		res.json(user.favorites);
	} catch (error) {
		console.error("Get favorite locations error:", error);
		res.status(500).json({ message: "Server error" });
	}
};

// Update User Location
exports.updateLocation = async (req, res) => {
	try {
		const userId = req.user._id;
		const { latitude, longitude } = req.body;

		if (typeof latitude !== "number" || typeof longitude !== "number") {
			return res.status(400).json({ message: "Invalid coordinates" });
		}

		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		// Update location
		user.currentLocation = {
			type: "Point",
			coordinates: [longitude, latitude],
		};

		// Clear visitedSites when location changes
		user.visitedSites = [];

		await user.save();

		res.json({
			message: "Location updated",
			currentLocation: user.currentLocation,
		});
	} catch (error) {
		console.error("Update location error:", error);
		res.status(500).json({ message: "Server error" });
	}
};

// Get User Profile
exports.getMe = async (req, res) => {
	try {
		const user = await User.findById(req.user._id).select("-password");
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}
		res.json(user);
	} catch (error) {
		console.error("Get current user error:", error);
		res.status(500).json({ message: "Server error" });
	}
};

// Get Nearby Cultural Sites
exports.collectAndGetVisitedSites = async (req, res) => {
	try {
		const user = await User.findById(req.user._id);
		if (
			!user.currentLocation ||
			!Array.isArray(user.currentLocation.coordinates)
		) {
			return res.status(400).json({ message: "No user location saved" });
		}
		const [lng, lat] = user.currentLocation.coordinates;
		const maxDistance = parseInt(req.query.maxDistance) || 1000; // meters

		// Find nearby sites
		const nearbySites = await CulturalSite.find({
			location: {
				$near: {
					$geometry: { type: "Point", coordinates: [lng, lat] },
					$maxDistance: maxDistance,
				},
			},
		});

		// Add new visited sites to user.visitedSites
		const newVisited = nearbySites
			.filter((site) => !user.visitedSites.some((id) => id.equals(site._id)))
			.map((site) => site._id);

		if (newVisited.length > 0) {
			user.visitedSites.push(...newVisited);
			await user.save();
		}

		// Populate and return visited sites
		await user.populate("visitedSites");
		res.json(user.visitedSites);
	} catch (error) {
		console.error("Collect/Get visited sites error:", error);
		res.status(500).json({ message: "Server error" });
	}
};
