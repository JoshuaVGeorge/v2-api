const express = require("express");
const { google } = require("googleapis");
const crypto = require("crypto");
require("dotenv").config();
const { bufferCreation } = require("../controller/bufferCreation");
const { ensureAuthenticated } = require("../controller/authController");
const { deleteAll } = require("../controller/deleteBuffer");

const router = express.Router();

const uuid = crypto.randomUUID();

// Placeholder for storing sync tokens (in production, use a database or persistent storage)
let storedSyncToken = null;

router.get("/events", ensureAuthenticated, async (req, res) => {
	const oauth2Client = new google.auth.OAuth2();
	oauth2Client.setCredentials({
		access_token: req.user.accessToken,
		refresh_token: req.user.refreshToken,
	});

	const calendar = google.calendar({ version: "v3", auth: oauth2Client });

	const now = new Date();
	const timeMax = new Date(now);
	timeMax.setDate(now.getDate() + 7);

	try {
		// Prepare the request parameters
		const params = {
			calendarId: process.env.CAL_ID,
			singleEvents: true,
		};

		if (storedSyncToken) {
			params.syncToken = storedSyncToken;
		} else {
			const now = new Date();
			const timeMax = new Date(now);
			timeMax.setDate(now.getDate() + 7);
			params.timeMin = now.toISOString();
			params.timeMax = timeMax.toISOString();
		}

		const events = await calendar.events.list(params);
		const { items, nextSyncToken } = events.data;

		if (nextSyncToken) {
			storedSyncToken = nextSyncToken;
			console.log("Next Sync Token:", nextSyncToken);
		}

		res.status(200).json(items);
	} catch (error) {
		if (error.code === 410) {
			// Invalid sync token, needs a full sync
			storedSyncToken = null;
			console.error("Sync token expired, resetting sync token.");
		} else {
			console.error("Error retrieving calendar events:", error);
		}
		res.status(500).json({ error: "Error retrieving calendar events" });
	}
});

router.post("/create-event", ensureAuthenticated, async (req, res) => {
	const {
		summary,
		description,
		location,
		startDateTime,
		endDateTime,
		timeZone,
	} = req.body;

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
			bufferCreation(event, oauth2Client);
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
		address: "http://localhost:5000/notifications",
	};

	try {
		const response = await calendar.events.watch({
			calendarId: process.env.CAL_ID,
			requestBody,
		});

		res.status(200).json(response.data);
	} catch (error) {
		console.error("Error setting up calendar watch:", error);
		res.status(500).json({ error: "Error setting up calendar watch" });
	}
});

router.delete("/delete-events", ensureAuthenticated, async (req, res) => {
	const oauth2Client = new google.auth.OAuth2();
	oauth2Client.setCredentials({
		access_token: req.user.accessToken,
		refresh_token: req.user.refreshToken,
	});

	const calendar = google.calendar({ version: "v3", auth: oauth2Client });

	const result = await deleteAll(calendar);
});

module.exports = router;
