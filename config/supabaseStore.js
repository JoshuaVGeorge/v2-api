import session from "express-session";
import { createClient } from "@supabase/supabase-js";

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
}

export default SupabaseStore;
