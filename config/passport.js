const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
require("dotenv").config();

passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.CLIENT_ID,
			clientSecret: process.env.CLIENT_SECRET,
			callbackURL: process.env.RE_URI,
			accessType: "offline",
			prompt: "consent",
		},
		function (accessToken, refreshToken, profile, done) {
			// console.log("Access Token:", accessToken);
			// console.log("Refresh Token:", refreshToken);
			const user = {
				profile: profile,
				accessToken: accessToken,
				refreshToken: refreshToken || null,
			};
			done(null, user);
		}
	)
);

passport.serializeUser((user, done) => {
	// console.log("serializeUser:", user.refreshToken);
	done(null, user);
});

passport.deserializeUser((user, done) => {
	done(null, user);
});

module.exports = passport;
