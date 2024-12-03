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
			secure: false,
			maxAge: 24 * 60 * 60 * 1000, // 1-day expiration
			sameSite: "None",
		},
	})
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
	console.log("Incoming Request Headers:", req.headers);
	next();
});

// Define routes
app.use("/auth", authRoutes);
app.use("/calendar", calendarRoutes);
app.use("/notifications", notificationRoutes);

app.get("/test", (req, res) => {
	res.send("test running");
});

app.get("/", (req, res) => {
	res.send("Backend is running");
});

app.get("/user", async (req, res) => {
	try {
		const sessionId = req.sessionID;

		// Fetch session from Supabase if needed
		const { data: session, error } = await supabase
			.from("session_information")
			.select("*")
			.eq("session_id", sessionId)
			.single();

		if (error || !session) {
			return res
				.status(401)
				.json({ authenticated: false, error: "No session found" });
		}

		// Set cookie for authenticated user
		res.setHeader(
			"Set-Cookie",
			`sessionId=${sessionId}; Path=/; HttpOnly; Secure; SameSite=None`
		);

		res.json({ authenticated: true, user: session });
	} catch (error) {
		console.error("Error fetching session:", error);
		res.status(500).json({ error: "Internal server error" });
	}

	// console.log("Cookies from request:", req.cookies);
	// if (req.isAuthenticated()) {
	// 	res.setHeader(
	// 		"Set-Cookie",
	// 		`sessionId=${req.sessionID}; Path=/; HttpOnly; Secure; SameSite=None`
	// 	);

	// 	res.json({ authenticated: true, user: req.user });
	// } else {
	// 	res
	// 		.status(401)
	// 		.json({ authenticated: false, error: "User not authenticated" });
	// }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log(`Server started on http://localhost:${PORT}`);
});
