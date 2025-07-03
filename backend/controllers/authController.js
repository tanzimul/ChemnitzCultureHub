const jwt = require("jsonwebtoken");
const User = require("../models/User");
const validator = require("validator");

// Generate JWT Token
const generateToken = (userId) => {
	return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Helper: Email validation
const isValidEmail = (email) =>
	typeof email === "string" && validator.isEmail(email.trim());

/**
 * @route   POST /api/auth/register
 * @desc    Register user
 * @access  Public
 */
exports.register = async (req, res) => {
	try {
		let { name, email, password } = req.body;

		name = name ? name.trim() : "";
		email = email ? email.trim().toLowerCase() : "";
		password = password ? password : "";

		if (!name || !email || !password) {
			return res.status(400).json({ message: "All fields are required" });
		}
		if (!isValidEmail(email)) {
			return res.status(400).json({ message: "Invalid email address" });
		}
		if (password.length < 6) {
			return res
				.status(400)
				.json({ message: "Password must be at least 6 characters long" });
		}
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({ message: "User already exists" });
		}

		const user = new User({ name, email, password });
		await user.save();

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
		// Handle Mongoose validation errors
		if (error.name === "ValidationError") {
			const firstError =
				Object.values(error.errors)[0]?.message || "Validation error";
			return res.status(400).json({ message: firstError });
		}
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
exports.login = async (req, res) => {
	try {
		let { email, password } = req.body;

		email = email ? email.trim().toLowerCase() : "";
		password = password ? password : "";

		if (!email || !password) {
			return res
				.status(400)
				.json({ message: "Email and password are required" });
		}
		if (!isValidEmail(email)) {
			return res.status(400).json({ message: "Invalid email address" });
		}
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(400).json({ message: "Invalid credentials" });
		}
		const isMatch = await user.comparePassword(password);
		if (!isMatch) {
			return res.status(400).json({ message: "Invalid credentials" });
		}

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
		if (error.name === "ValidationError") {
			const firstError =
				Object.values(error.errors)[0]?.message || "Validation error";
			return res.status(400).json({ message: firstError });
		}
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
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
		res.status(500).json({ message: "Server error" });
	}
};
