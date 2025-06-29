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
const sampleRoutes = require("./routes/samples");
const culturalSitesRoutes = require("./routes/culturalSites");
const app = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 10000, // limit each IP to 100 requests per windowMs
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
app.use("/api/samples", sampleRoutes);
app.use("/api/cultural-sites", culturalSitesRoutes);
app.use("/api/users/favorites", userRoutes);

// Health check
app.get("/api/health", (req, res) => {
	console.log("health is okay");
	res.json({
		message: "ChemnitzCultureHub API is running!",
	});
});

function printRoutes(app) {
	const protocol = process.env.PROTOCOL || "http";
	const host = process.env.HOST || "localhost";
	const port = process.env.PORT || 5000;

	app.router.stack.forEach((middleware) => {
		if (middleware.route) {
			// Routes registered directly on the app
			const route = middleware.route;
			const methods = Object.keys(route.methods).join(", ").toUpperCase();
			console.log(`${methods} ${protocol}://${host}:${port}${route.path}`);
		} else if (middleware.name === "router" && middleware.handle.stack) {
			// Routes added as router middleware (e.g., app.use('/api/auth', authRoutes))
			middleware.handle.stack.forEach((handler) => {
				if (handler.route) {
					const route = handler.route;
					const methods = Object.keys(route.methods).join(", ").toUpperCase();
					let path = "";
					if (middleware.regexp && middleware.regexp.source) {
						path = middleware.regexp.source
							.replace("^\\", "/")
							.replace("\\/?(?=\\/|$)", "")
							.replace("?", "")
							.replace(/\\\//g, "/")
							.replace(/\$$/, "");
					}
					console.log(
						`${methods} ${protocol}://${host}:${port}${path}${route.path}`
					);
				}
			});
		}
	});
}

// Error handling middleware
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
	printRoutes(app);
});
