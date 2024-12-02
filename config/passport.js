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
			// Extract user data from the profile
			const userId = profile.id;
			const email = profile.emails[0].value;

			try {
				// Save the user data to the database
				const { data, error } = await supabase
					.from("user_information")
					.upsert(
						{ user_id: userId, user_email: email },
						{ onConflict: "user_id" }
					);

				if (error) {
					console.error(
						"Error inserting/updating user data in Supabase:",
						error
					);
					return done(error, null);
				}

				// console.log(
				// 	"User data successfully inserted/updated in Supabase:",
				// 	data
				// );
				return done(null, { userId });
			} catch (err) {
				console.error("Unexpected error in Passport strategy:", err);
				return done(err, null);
			}
		}
	)
);

passport.serializeUser((user, done) => {
	// console.log("Serializing user:", user);
	done(null, user.userId); // Save only the userId in the session
});

// Deserialize the user from the session
passport.deserializeUser(async (userId, done) => {
	// console.log("Deserializing user with userId:", userId);

	try {
		// Fetch the user from your `user_information` table
		const { data, error } = await supabase
			.from("user_information")
			.select("*")
			.eq("user_id", userId)
			.single();

		if (error || !data) {
			console.error(
				"Error fetching user or user not found:",
				error || "User not found"
			);
			return done(error || new Error("User not found"), null);
		}

		// Log the data to see what is being returned
		// console.log("User data fetched from database:", data);

		// Make sure `data` has the expected properties before passing to `done`
		done(null, data);
	} catch (err) {
		console.error("Error in deserializeUser:", err);
		done(err, null);
	}
});

module.exports = passport;
