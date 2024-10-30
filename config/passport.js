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
		(accessToken, refreshToken, profile, done) => {
			// need to save rest of user data to DB

			const userId = profile.id;
			return done(null, { userID });
		}
	)
);

passport.serializeUser((user, done) => {
	// console.log("serializeUser:", user);
	done(null, user.userID);
});

passport.deserializeUser((user, done) => {
	done(null, user);
});

module.exports = passport;
