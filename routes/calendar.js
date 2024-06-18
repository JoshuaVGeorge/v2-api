const express = require("express");
const { google } = require("googleapis");
require("dotenv").config();

const router = express.Router();

router.post("/create-event", async (req, res) => {
	if (!req.isAuthenticated()) {
		return res.status(401).json({ error: "User not authenticated" });
	}

	const { summary, description, location, startDateTime, endDateTime } =
		req.body;

	const oauth2Client = new google.auth.OAuth2();
	oauth2Client.setCredentials({
		access_token: req.user.accessToken,
		refresh_token: req.user.refreshToken,
	});

	const calendar = google.calendar({ version: "v3", auth: oauth2Client });

	try {
		const event = {
			summary: summary,
			description: description,
			location: location,
			start: {
				dateTime: startDateTime,
				timeZone: "America/Los_Angeles", // Adjust as needed
			},
			end: {
				dateTime: endDateTime,
				timeZone: "America/Los_Angeles", // Adjust as needed
			},
		};

		const response = await calendar.events.insert({
			calendarId: process.env.CAL_ID,
			resource: event,
		});

		res.status(200).json(response.data);
	} catch (error) {
		console.error("Error creating calendar event:", error);
		res.status(500).json({ error: "Error creating calendar event" });
	}
});

module.exports = router;
