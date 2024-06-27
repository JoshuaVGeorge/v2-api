const express = require("express");
const { google } = require("googleapis");
const crypto = require("crypto");
require("dotenv").config();
const { bufferCreation } = require("../controller/bufferCreation");

const router = express.Router();

const uuid = crypto.randomUUID();

const ensureAuthenticated = (req, res, next) => {
	if (req.isAuthenticated()) {
		return next();
	} else {
		res.status(401).json({ error: "User not authenticated" });
	}
};

router.post("/create-event", ensureAuthenticated, async (req, res) => {
	const { summary, description, location, startDateTime, endDateTime } =
		req.body;

	// Define the hard-coded time zone. MAKE THIS DYNAMIC WITH FRONTEND
	const timeZone = "America/Los_Angeles";

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
				timeZone: timeZone,
			},
			end: {
				dateTime: endDateTime,
				timeZone: timeZone,
			},
		};

		const response = await calendar.events.insert({
			calendarId: process.env.CAL_ID,
			resource: event,
		});

		if (location) {
			bufferCreation(event);
		}

		res.status(200).json(response.data);
	} catch (error) {
		console.error("Error creating calendar event:", error);
		res.status(500).json({ error: "Error creating calendar event" });
	}
});

router.post("/watch-calendar", ensureAuthenticated, async (req, res) => {
	const oauth2Client = new google.auth.OAuth2();
	oauth2Client.setCredentials({
		access_token: req.user.accessToken,
		refresh_token: req.user.refreshToken,
	});

	const calendar = google.calendar({ version: "v3", auth: oauth2Client });

	const requestBody = {
		id: uuid,
		type: "webhook",
		address: "http://localhost:5000/calendar/notifications",
	};

	try {
		const response = await calendar.events.watch({
			calendarId: "primary",
			requestBody,
		});

		res.status(200).json(response.data);
	} catch (error) {
		console.error("Error setting up calendar watch:", error);
		res.status(500).json({ error: "Error setting up calendar watch" });
	}
});

router.post("/notifications", async (req, res) => {
	console.log("Received notification:", req.body);
	// Process the notification (e.g., retrieve the event details)
	res.status(200).send("OK");
});

module.exports = router;
