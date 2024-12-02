const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const SUPABASE_URL = process.env.SUPA_URL;
const SUPABASE_ANON_KEY = process.env.SUPA_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const addUser = async (req, res) => {
	const { userId, email } = req.body;

	const { data, error } = await supabase
		.from("user_information")
		.insert([{ user_id: userId, user_email: email }]);

	if (error) {
		console.error("Error adding user:", error);
		return { success: false, error };
	} else {
		console.log(`user: ${id} added`);
	}

	return { success: true, data };
};

module.exports = { addUser };
