const User = require("../models/User");

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
		const { name, address, description } = req.body;
		const userId = req.user._id;

		const user = await User.findById(userId);
		user.favorites.push({ name, address, description });
		await user.save();

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
		const id = req.params.id;
		const user = await User.findById(req.user._id);
		console.log(user.favorites, "User's favorites before removal");
		if (!user.favorites) user.favorites = [];
		user.favorites = user.favorites.filter((fav) => fav._id.toString() !== id);
		await user.save();
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
		//const user = await User.findById(req.user._id).select("favoriteLocations");
		const user = await User.findById(req.user._id);
		console.log("User's favorite locations:", user.favorites);
		res.json(user.favorites);
		//res.json({ favoriteLocations: user.favoriteLocations });
	} catch (error) {
		console.error("Get favorite locations error:", error);
		res.status(500).json({ message: "Server error" });
	}
};
