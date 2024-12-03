const express = require("express");
const passport = require("passport");
const dbController = require("../controller/dbController");

const router = express.Router();

router.get(
	"/google",
	passport.authenticate("google", {
		scope: [
			"profile",
			"email",
			"openid",
			"https://www.googleapis.com/auth/calendar.events",
		],
		accessType: "offline",
		prompt: "consent",
	})
);

router.get(
	"/google/callback",
	passport.authenticate("google", { failureRedirect: "/" }),
	(req, res) => {
		// console.log("Session after login:", JSON.stringify(req.session, null, 2));
		res.redirect("http://localhost:3000");
	}
);

router.get("/logout", (req, res) => {
	req.logout((err) => {
		if (err) {
			console.error("Error during logout:", err);
			return res.status(500).send("Error logging out");
		}

		req.session.destroy((err) => {
			if (err) {
				console.error("Error destroying session:", err);
				return res.status(500).send("Error destroying session");
			}

			// Successfully logged out, redirect or respond
			res.clearCookie("connect.sid");
			res.send("Logged out successfully");
		});
	});
});

router.route("/new").post(dbController.addUser);

module.exports = router;
