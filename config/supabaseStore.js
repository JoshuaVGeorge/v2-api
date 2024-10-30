const session = require("express-session");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const SUPABASE_URL = process.env.SUPA_URL;
const SUPABASE_ANON_KEY = process.env.SUPA_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

class SupabaseStore extends session.Store {
	async get(sessionId, callback) {
		try {
			console.log(`Attempting to get session data for sessionId: ${sessionId}`);
			const { data, error } = await supabase
				.from("session_information")
				.select("user_id")
				.eq("session_id", sessionId)
				.single();

			if (error) {
				console.error(
					`Error retrieving session data for sessionId ${sessionId}:`,
					error
				);
				return callback(error, null);
			}
			if (!data) {
				console.warn(`No session data found for sessionId: ${sessionId}`);
				return callback(null, null);
			}

			console.log(
				`Successfully retrieved session data for sessionId: ${sessionId}`
			);
			callback(null, data.data);
		} catch (err) {
			console.error(
				`Unexpected error in get method for sessionId ${sessionId}:`,
				err
			);
			callback(err, null);
		}
	}

	async set(sessionId, sessionData, callback) {
		try {
			const userId = sessionData.passport.user || null;
			const expires = sessionData.cookie.expires
				? new Date(sessionData.cookie.expires)
				: null;
			console.log(
				`Attempting to set session data for sessionId: ${sessionId}, userId: ${userId}`
			);

			const { data, error } = await supabase
				.from("session_information")
				.upsert({
					session_id: sessionId,
					user_id: userId,
					session_expiry: expires,
				});

			if (error) {
				console.error(
					`Error setting session data for sessionId ${sessionId}:`,
					error
				);
				return callback(error);
			}

			console.log(`Successfully set session data for sessionId: ${sessionId}`);
			callback(null, data);
		} catch (err) {
			console.error(
				`Unexpected error in set method for sessionId ${sessionId}:`,
				err
			);
			callback(err);
		}
	}

	async destroy(sessionId, callback) {
		try {
			console.log(
				`Attempting to destroy session data for sessionId: ${sessionId}`
			);
			const { error } = await supabase
				.from("session_information")
				.delete()
				.eq("session_id", sessionId);

			if (error) {
				console.error(
					`Error destroying session data for sessionId ${sessionId}:`,
					error
				);
				return callback(error);
			}

			console.log(
				`Successfully destroyed session data for sessionId: ${sessionId}`
			);
			callback(null);
		} catch (err) {
			console.error(
				`Unexpected error in destroy method for sessionId ${sessionId}:`,
				err
			);
			callback(err);
		}
	}
}

module.exports = SupabaseStore;
