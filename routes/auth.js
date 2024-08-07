const express = require("express");
const passport = require("passport");

const router = express.Router();

router.get(
	"/google",
	passport.authenticate("google", {
		scope: ["profile", "email", "openid"],
		accessType: "offline",
		prompt: "consent",
	})
);

router.get(
	"/google/callback",
	passport.authenticate("google", { failureRedirect: "/" }),
	(req, res) => {
		res.redirect("/");
	}
);

router.get("/logout", (req, res, next) => {
	req.logout((err) => {
		if (err) {
			return next(err);
		}
		req.session.destroy((err) => {
			if (err) {
				return next(err);
			}
			res.redirect("/");
		});
	});
});

module.exports = router;
