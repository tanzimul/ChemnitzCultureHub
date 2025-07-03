const jwt = require("jsonwebtoken");
const User = require("../models/User");
const validator = require("validator");

// Generate JWT Token
const generateToken = (userId) => {
	return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Helper: Simple email regex
const isValidEmail = (email) =>
	typeof email === "string" && validator.isEmail(email.trim());

// Register User
exports.register = async (req, res) => {
	try {
		let { name, email, password } = req.body;

		// Trim input
		name = name ? name.trim() : "";
		email = email ? email.trim().toLowerCase() : "";
		password = password ? password : "";

		// Check for missing fields
		if (!name || !email || !password) {
			return res.status(400).json({ message: "All fields are required" });
		}

		// Validate email format
		if (!isValidEmail(email)) {
			return res.status(400).json({ message: "Invalid email address" });
		}

		// Password length check
		if (password.length < 6) {
			return res
				.status(400)
				.json({ message: "Password must be at least 6 characters long" });
		}

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

		// Handle Mongoose validation errors
		if (error.name === "ValidationError") {
			const firstError =
				Object.values(error.errors)[0]?.message || "Validation error";
			return res.status(400).json({ message: firstError });
		}

		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// Login User
exports.login = async (req, res) => {
	try {
		let { email, password } = req.body;

		email = email ? email.trim().toLowerCase() : "";
		password = password ? password : "";

		// Check for missing fields
		if (!email || !password) {
			return res
				.status(400)
				.json({ message: "Email and password are required" });
		}

		// Validate email format
		if (!isValidEmail(email)) {
			return res.status(400).json({ message: "Invalid email address" });
		}

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
		if (error.name === "ValidationError") {
			const firstError =
				Object.values(error.errors)[0]?.message || "Validation error";
			return res.status(400).json({ message: firstError });
		}

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
