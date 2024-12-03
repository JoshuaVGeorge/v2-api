const session = require("express-session");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const SUPABASE_URL = process.env.SUPA_URL;
const SUPABASE_ANON_KEY = process.env.SUPA_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

class SupabaseStore extends session.Store {
	async get(sessionId, callback) {
		try {
			// console.log(`Fetching session data for sessionId: ${sessionId}`);
			const { data, error } = await supabase
				.from("session_information")
				.select("session_data")
				.eq("session_id", sessionId)
				.single();

			if (error) {
				console.error("Error fetching session data from Supabase:", error);
				return callback(error, null);
			}

			if (!data) {
				console.warn(`No session data found for sessionId: ${sessionId}`);
				return callback(null, null);
			}

			// console.log(
			// 	"Session data successfully retrieved from Supabase:",
			// 	data.session_data
			// );
			// Make sure to return the actual session data
			callback(null, data.session_data); // This should be the correct structure
		} catch (err) {
			console.error("Unexpected error in SupabaseStore get method:", err);
			callback(err, null);
		}
	}

	async set(sessionId, sessionData, callback) {
		try {
			// Ensure sessionData includes the correct format
			const sessionToStore = {
				...sessionData,
				passport: sessionData.passport, // Ensure the passport object is included
			};

			const expires = sessionData.cookie.expires
				? new Date(sessionData.cookie.expires)
				: null;

			const { error } = await supabase.from("session_information").upsert(
				{
					session_id: sessionId,
					session_data: sessionToStore, // Save the complete session data
					session_expiry: expires,
					user_id: sessionData.passport.user,
				},
				{ onConflict: "session_id" }
			);

			console.log("Cookie Sent to Frontend:", sessionData);

			if (error) {
				console.error("Error saving session data to Supabase:", error);
				return callback(error);
			}

			// console.log("Session data successfully saved to Supabase");
			callback(null);
		} catch (err) {
			console.error("Unexpected error in SupabaseStore set method:", err);
			callback(err);
		}
	}

	async destroy(sessionId, callback) {
		try {
			// console.log(
			// 	`Attempting to destroy session data for sessionId: ${sessionId}`
			// );
			const { error } = await supabase
				.from("session_information")
				.delete()
				.eq("session_id", sessionId);

			if (error) {
				console.error(
					`Error destroying session data for sessionId ${sessionId}:`,
					JSON.stringify(error, null, 2)
				);
				return callback(error);
			}

			// console.log(
			// 	`Successfully destroyed session data for sessionId: ${sessionId}`
			// );
			callback(null);
		} catch (err) {
			console.error(
				`Unexpected error in destroy method for sessionId ${sessionId}:`,
				JSON.stringify(err, null, 2)
			);
			callback(err);
		}
	}
}

module.exports = SupabaseStore;
