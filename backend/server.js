const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const connectDB = require("./config/db");

// Route imports
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const culturalSitesRoutes = require("./routes/culturalSites");
const reviewRoutes = require("./routes/review");
const tradeCodeRoutes = require("./routes/tradeCode");

const app = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 10000,
});
app.use(limiter);

// CORS
app.use(
	cors({
		origin:
			process.env.NODE_ENV === "development"
				? process.env.DEV_URL
				: process.env.CLIENT_URL,
		credentials: true,
	})
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cultural-sites", culturalSitesRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/trade-codes", tradeCodeRoutes);

// Health check
app.get("/api/health", (req, res) => {
	res.json({
		message: "ChemnitzCultureHub API is running!",
	});
});

// Error handling middleware
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
