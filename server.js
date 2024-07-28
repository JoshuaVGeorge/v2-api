const express = require("express");
const session = require("express-session");
const cors = require("cors");
const passport = require("./config/passport");
const authRoutes = require("./routes/auth");
const calendarRoutes = require("./routes/calendar");
const notificationRoutes = require("./routes/notifications");
require("dotenv").config();

const app = express();
app.use(express.json());

app.use(
	cors({
		origin: "http://localhost:3000", // React app URL
		credentials: true,
	})
);

// Configure session middleware
app.use(
	session({
		secret: process.env.S_KEY,
		resave: false,
		saveUninitialized: true,
		cookie: { secure: false }, // Set to true if using HTTPS
	})
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Define routes
app.use("/auth", authRoutes);
app.use("/calendar", calendarRoutes);
app.use("/notifications", notificationRoutes);

app.get("/", (req, res) => {
	res.send("Backend is running");
	// if (req.isAuthenticated()) {
	// 	res.send(
	// 		`Hello ${req.user.profile.displayName} <a href="/auth/logout">Logout</a>`
	// 	);
	// 	// console.log("auth User:", req.user.accessToken);
	// } else {
	// 	res.send('Hello Guest. <a href="/auth/google">Login with Google</a>');
	// }
});

app.get("/user", (req, res) => {
	console.log(req.user);
	// if (req.isAuthenticated()) {
	// 	res.json(req.user);
	// } else {
	// 	res.status(401).json({ error: "User not authenticated" });
	// }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log(`Server started on http://localhost:${PORT}`);
});
