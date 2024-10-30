const session = require("express-session");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const SUPABASE_URL = process.env.SUPA_URL;
const SUPABASE_ANON_KEY = process.env.SUPA_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

class SupabaseStore extends session.Store {
	async get(sessionId, callback) {
		try {
			const { data, error } = await supabase
				.from("session_information")
				.select("user_id")
				.eq("session_id", sessionId)
				.single();

			if (error) return callback(error, null);
			if (!data) return callback(null, null);

			callback(null, data.data);
		} catch (err) {
			callback(err, null);
		}
	}

	async set(sessionId, sessionData, callback) {
		try {
			const userId = sessionData.userId;
			const expire = sessionData.cookie.expires
				? new Date(sessionData.cookie.expires)
				: null;
			const { data, error } = await supabase
				.from("session_information")
				.upsert({
					session_id: sessionId,
					user_id: userId,
					session_expiry: expire,
				});

			if (error) return callback(error);
			callback(null, data);
		} catch (err) {
			callback(err);
		}
	}

	async destroy(sessionId, callback) {
		try {
			const { error } = await supabase
				.from("session_information")
				.delete()
				.eq("session_id", sessionId);

			if (error) return callback(error);
			callback(null);
		} catch (err) {
			callback(err);
		}
	}
}

module.exports = {
	SupabaseStore,
};
