const User = require("../models/User");
const CulturalSite = require("../models/CulturalSite");
const Review = require("../models/Review");
const TradeCode = require("../models/TradeCode");

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
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

/**
 * @route   POST /api/users/favorites
 * @desc    Add favorite location
 * @access  Private
 */
exports.addFavoriteLocation = async (req, res) => {
	try {
		const { siteId } = req.body;
		const userId = req.user._id;
		const user = await User.findById(userId);
		const site = await CulturalSite.findById(siteId);

		// Prevent favoriting unwanted sites
		if (
			!site ||
			["unknown", "uncategorized"].includes((site.name || "").toLowerCase()) ||
			["unknown", "uncategorized"].includes((site.category || "").toLowerCase())
		) {
			return res.status(400).json({ message: "Cannot favorite this site." });
		}

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

/**
 * @route   DELETE /api/users/favorites/:id
 * @desc    Remove favorite location
 * @access  Private
 */
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

/**
 * @route   GET /api/users/favorites
 * @desc    Get user's favorite locations
 * @access  Private
 */
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

/**
 * @route   PUT /api/users/location
 * @desc    Update user's current location
 * @access  Private
 */
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

/**
 * @route   GET /api/users/me
 * @desc    Get user profile
 * @access  Private
 */
exports.getMe = async (req, res) => {
	try {
		const user = await User.findById(req.user._id)
			.select("-password")
			.populate("inventory.site");
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}
		res.json(user);
	} catch (error) {
		console.error("Get current user error:", error);
		res.status(500).json({ message: "Server error" });
	}
};

/**
 * @route   DELETE /api/users/me
 * @desc    Delete user profile
 * @access  Private
 */
exports.deleteMe = async (req, res) => {
	try {
		const userId = req.user._id;

		// Delete user's reviews
		await Review.deleteMany({ user: userId });

		// Remove user from other users' favorites
		await User.updateMany(
			{ favorites: userId },
			{ $pull: { favorites: userId } }
		);

		// remove user from other users' trade histories
		await User.updateMany(
			{ "inventory.tradeHistory.to": userId },
			{ $pull: { "inventory.$[].tradeHistory": { to: userId } } }
		);

		// Delete the user
		await User.findByIdAndDelete(userId);

		res.json({ message: "User and all related data deleted successfully" });
	} catch (err) {
		console.error("Delete user error:", err);
		res.status(500).json({ message: "Failed to delete user" });
	}
};

/**
 * @route   GET /api/users/me/stats
 * @desc    Get user's stats (favorites, visited, inventory)
 * @access  Private
 */
exports.getUserStats = async (req, res) => {
	try {
		const user = await User.findById(req.user._id)
			.populate("favorites")
			.populate("visitedSites")
			.populate("inventory.site");

		if (!user) return res.status(404).json({ message: "User not found" });

		res.json({
			favorites: user.favorites ? user.favorites.length : 0,
			visited: user.visitedSites ? user.visitedSites.length : 0,
			inventory: user.inventory ? user.inventory.length : 0,
			userlocation: user.currentLocation || null,
		});
	} catch (err) {
		res.status(500).json({ message: "Failed to fetch stats" });
	}
};

/**
 * @route   GET /api/users/visited-sites
 * @desc    Get user's visited cultural sites (and collect new nearby)
 * @access  Private
 */
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

		// Find nearby sites, filter out unwanted ones
		const nearbySites = await CulturalSite.find({
			location: {
				$near: {
					$geometry: { type: "Point", coordinates: [lng, lat] },
					$maxDistance: maxDistance,
				},
			},
			name: { $nin: ["Unknown", "unknown"] },
			category: { $nin: ["Uncategorized", "uncategorized"] },
		});

		const newVisited = nearbySites
			.filter((site) => !user.visitedSites.some((id) => id.equals(site._id)))
			.map((site) => site._id);

		if (newVisited.length > 0) {
			user.visitedSites.push(...newVisited);
			await user.save();
		}

		await user.populate("visitedSites");
		res.json(user.visitedSites);
	} catch (error) {
		console.error("Collect/Get visited sites error:", error);
		res.status(500).json({ message: "Server error" });
	}
};

/**
 * @route   POST /api/users/catch-site
 * @desc    Catch a cultural site (add to inventory)
 * @access  Private
 */
exports.catchSite = async (req, res) => {
	try {
		const user = await User.findById(req.user._id);
		const { siteId } = req.body;
		const site = await CulturalSite.findById(siteId);

		// Prevent saving unwanted sites
		if (
			!site ||
			["unknown", "uncategorized"].includes((site.name || "").toLowerCase()) ||
			["unknown", "uncategorized"].includes((site.category || "").toLowerCase())
		) {
			return res.status(400).json({ message: "Cannot catch this site." });
		}

		let entry = user.inventory.find((c) => c.site.toString() === siteId);
		if (entry) {
			entry.count += 1;
		} else {
			user.inventory.push({ site: siteId, count: 1 });
		}
		await user.save();
		await user.populate("inventory.site");
		res.json({ message: "Site caught!", inventory: user.inventory });
	} catch (error) {
		res
			.status(500)
			.json({ message: "Error catching site", error: error.message });
	}
};

// /**
//  * @route   POST /api/users/trade-site
//  * @desc    Trade a cultural site with another user
//  * @access  Private
//  */
// exports.tradeSite = async (req, res) => {
// 	try {
// 		const { toUserId, siteId } = req.body;
// 		const fromUser = await User.findById(req.user._id);
// 		const toUser = await User.findById(toUserId);
// 		const site = await CulturalSite.findById(siteId);

// 		// Prevent trading unwanted sites
// 		if (
// 			!site ||
// 			["unknown", "uncategorized"].includes((site.name || "").toLowerCase()) ||
// 			["unknown", "uncategorized"].includes((site.category || "").toLowerCase())
// 		) {
// 			return res.status(400).json({ message: "Cannot trade this site." });
// 		}

// 		// ...existing trade logic...
// 		const fromEntry = fromUser.inventory.find(
// 			(c) => c.site.toString() === siteId
// 		);
// 		if (!fromEntry || fromEntry.count < 1) {
// 			return res
// 				.status(400)
// 				.json({ message: "You don't have this site to trade." });
// 		}
// 		fromEntry.count -= 1;
// 		fromEntry.tradeHistory.push({ to: toUserId, type: "sent" });
// 		if (fromEntry.count === 0) {
// 			fromUser.inventory = fromUser.inventory.filter(
// 				(c) => c.site.toString() !== siteId
// 			);
// 		}

// 		let toEntry = toUser.inventory.find((c) => c.site.toString() === siteId);
// 		if (toEntry) {
// 			toEntry.count += 1;
// 			toEntry.tradeHistory.push({ to: fromUser._id, type: "received" });
// 		} else {
// 			toUser.inventory.push({
// 				site: siteId,
// 				count: 1,
// 				tradeHistory: [{ to: fromUser._id, type: "received" }],
// 			});
// 		}

// 		await fromUser.save();
// 		await toUser.save();

// 		res.json({ message: "Trade successful!" });
// 	} catch (error) {
// 		res.status(500).json({ message: "Trade failed", error: error.message });
// 	}
// };

/**
 * @route   POST /api/users/generate-trade-code
 * @desc    Generate a trade code for trading sites
 * @access  Private
 */
exports.tradeSite = async (req, res) => {
	try {
		const { tradeCode, siteId } = req.body;
		const fromUser = await User.findById(req.user._id);

		// Use your existing trade code logic
		const tradeCodeDoc = await TradeCode.findOne({ code: tradeCode }).populate(
			"user"
		);
		if (!tradeCodeDoc || tradeCodeDoc.expiresAt < new Date()) {
			return res
				.status(400)
				.json({ message: "Invalid or expired trade code." });
		}
		const toUser = tradeCodeDoc.user;

		const site = await CulturalSite.findById(siteId);

		// ...existing trade logic...
		const fromEntry = fromUser.inventory.find(
			(c) => c.site.toString() === siteId
		);
		if (!fromEntry || fromEntry.count < 1) {
			return res
				.status(400)
				.json({ message: "You don't have this site to trade." });
		}
		fromEntry.count -= 1;
		fromEntry.tradeHistory.push({ to: toUser._id, type: "sent" });
		if (fromEntry.count === 0) {
			fromUser.inventory = fromUser.inventory.filter(
				(c) => c.site.toString() !== siteId
			);
		}

		let toEntry = toUser.inventory.find((c) => c.site.toString() === siteId);
		if (toEntry) {
			toEntry.count += 1;
			toEntry.tradeHistory.push({ to: fromUser._id, type: "received" });
		} else {
			toUser.inventory.push({
				site: siteId,
				count: 1,
				tradeHistory: [{ to: fromUser._id, type: "received" }],
			});
		}

		await fromUser.save();
		await toUser.save();
		await TradeCode.deleteOne({ code: tradeCode });

		res.json({ message: "Trade successful!" });
	} catch (error) {
		res.status(500).json({ message: "Trade failed", error: error.message });
	}
};
