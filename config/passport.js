const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { createClient } = require("@supabase/supabase-js");

require("dotenv").config();
const SUPABASE_URL = process.env.SUPA_URL;
const SUPABASE_ANON_KEY = process.env.SUPA_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.CLIENT_ID,
			clientSecret: process.env.CLIENT_SECRET,
			callbackURL: process.env.RE_URI,
			accessType: "offline",
			prompt: "consent",
		},
		async (accessToken, refreshToken, profile, done) => {
			const userId = profile.id;
			const email = profile.emails[0].value;

			try {
				const { data, error } = await supabase
					.from("user_information")
					.upsert(
						{ user_id: userId, user_email: email },
						{ onConflict: "user_id" }
					);

				if (error) {
					return done(error, null);
				}

				return done(null, { userId });
			} catch (err) {
				return done(err, null);
			}
		}
	)
);

passport.serializeUser((user, done) => {
	// console.log("serializeUser:", user.userId);
	done(null, user.userId);
});

passport.deserializeUser((user, done) => {
	done(null, user);
});

module.exports = passport;
