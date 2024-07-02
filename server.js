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

// Use corsOptions when implementing a front end
// const corsOptions = {
// 	origin: 'http://your-frontend-domain.com',
// 	credentials: true
//   };

app.use(cors());

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
	if (req.isAuthenticated()) {
		res.send(
			`Hello ${req.user.profile.displayName} <a href="/auth/logout">Logout</a>`
		);
		// console.log("auth User:", req.user.accessToken);
	} else {
		res.send('Hello Guest. <a href="/auth/google">Login with Google</a>');
	}
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log(`Server started on http://localhost:${PORT}`);
});
