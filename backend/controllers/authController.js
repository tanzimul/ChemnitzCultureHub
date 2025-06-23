const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Generate JWT Token
const generateToken = (userId) => {
	return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Register User
exports.register = async (req, res) => {
	try {
		const { name, email, password } = req.body;

		// Check if user exists
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({ message: "User already exists" });
		}

		// Create user
		const user = new User({ name, email, password });
		await user.save();

		// Generate token
		const token = generateToken(user._id);

		res.status(201).json({
			message: "User registered successfully",
			token,
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
			},
		});
	} catch (error) {
		console.error("Register error:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// Login User
exports.login = async (req, res) => {
	try {
		const { email, password } = req.body;

		// Check if user exists
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(400).json({ message: "Invalid credentials" });
		}

		// Check password
		const isMatch = await user.comparePassword(password);
		if (!isMatch) {
			return res.status(400).json({ message: "Invalid credentials" });
		}

		// Generate token
		const token = generateToken(user._id);

		res.json({
			message: "Login successful",
			token,
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
			},
		});
	} catch (error) {
		console.error("Login error:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// Get Current User
exports.getMe = async (req, res) => {
	try {
		res.json({
			user: {
				id: req.user._id,
				name: req.user.name,
				email: req.user.email,
				favoriteLocations: req.user.favoriteLocations,
			},
		});
	} catch (error) {
		console.error("Get me error:", error);
		res.status(500).json({ message: "Server error" });
	}
};
