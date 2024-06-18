const express = require("express");
const session = require("express-session");
const passport = require("./config/passport");
const authRoutes = require("./routes/auth");
const calendarRoutes = require("./routes/calendar");
require("dotenv").config();

const app = express();

// Configure session middleware
app.use(
	session({
		secret: process.env.S_KEY,
		resave: false,
		saveUninitialized: true,
	})
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Define routes
app.use("/auth", authRoutes);
app.use("/calendar", calendarRoutes);

app.get("/", (req, res) => {
	if (req.isAuthenticated()) {
		res.send(
			`Hello ${req.user.profile.displayName} <a href="/auth/logout">Logout</a>`
		);
		// console.log("auth User:", req.user.refreshToken);
	} else {
		res.send('Hello Guest. <a href="/auth/google">Login with Google</a>');
	}
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log(`Server started on http://localhost:${PORT}`);
});
