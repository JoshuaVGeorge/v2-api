const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const SUPABASE_URL = process.env.SUPA_URL;
const SUPABASE_ANON_KEY = process.env.SUPA_KEY;

const supabase = createClient(SUPA_URL, SUPA_KEY);

const addUser = async (id, email) => {
	const { data, error } = await supabase
		.from("user_information") // Specify the table name
		.insert([
			{ user_id: id, user_email: email }, // Insert user data
		]);

	if (error) {
		console.error("Error adding user:", error);
		return { success: false, error };
	}

	return { success: true, data };
};

module.exports = { addUser };
