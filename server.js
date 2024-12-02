const express = require("express");
const session = require("express-session");
const cors = require("cors");
const passport = require("./config/passport");
const authRoutes = require("./routes/auth");
const calendarRoutes = require("./routes/calendar");
const notificationRoutes = require("./routes/notifications");
const SupabaseStore = require("./config/supabaseStore");
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
		store: new SupabaseStore(),
		secret: process.env.S_KEY,
		resave: false,
		saveUninitialized: false,
		rolling: true,
		cookie: {
			httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
			secure: process.env.NODE_ENV === "production", // Use true in production (requires HTTPS)
			maxAge: 24 * 60 * 60 * 1000, // 1-day expiration
		},
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
});

app.get("/user", (req, res) => {
	if (req.isAuthenticated()) {
		res.json({ authenticated: true, user: req.user });
	} else {
		res
			.status(401)
			.json({ authenticated: false, error: "User not authenticated" });
	}
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log(`Server started on http://localhost:${PORT}`);
});
