const { google } = require("googleapis");
require("dotenv").config();

const bufferCreation = async (event, oauth2Client) => {
	console.log(`Event created with location: ${event.location}`);

	const calendar = google.calendar({ version: "v3", auth: oauth2Client });

	// Calculate the start and end times for the buffer events
	const primaryStart = new Date(event.start.dateTime);
	const primaryEnd = new Date(event.end.dateTime);

	const bufferStartBefore = new Date(primaryStart.getTime() - 10 * 60000);
	const bufferEndBefore = primaryStart;

	const bufferStartAfter = primaryEnd;
	const bufferEndAfter = new Date(primaryEnd.getTime() + 10 * 60000);

	try {
		// Create the before event
		const beforeEvent = {
			summary: "Buffer Time Before",
			description: "Buffer time before the main event",
			location: event.location,
			start: {
				dateTime: bufferStartBefore.toISOString(),
				timeZone: event.start.timeZone,
			},
			end: {
				dateTime: bufferEndBefore.toISOString(),
				timeZone: event.start.timeZone,
			},
		};

		await calendar.events.insert({
			calendarId: process.env.CAL_ID,
			resource: beforeEvent,
		});

		// Create the after event
		const afterEvent = {
			summary: "Buffer Time After",
			description: "Buffer time after the main event",
			location: event.location,
			start: {
				dateTime: bufferStartAfter.toISOString(),
				timeZone: event.start.timeZone,
			},
			end: {
				dateTime: bufferEndAfter.toISOString(),
				timeZone: event.start.timeZone,
			},
		};

		await calendar.events.insert({
			calendarId: process.env.CAL_ID,
			resource: afterEvent,
		});

		console.log("Buffer events created successfully");
	} catch (error) {
		console.error("Error creating buffer events:", error);
	}
};

module.exports = {
	bufferCreation,
};
