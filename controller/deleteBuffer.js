const { google } = require("googleapis");
require("dotenv").config();

const deleteAll = async (oauth2Client) => {
	const calendar = google.calendar({ version: "v3", auth: oauth2Client });
	const keyPhrase = "#schedulr";

	try {
		const now = new Date().toISOString();
		const eventsResponse = await calendar.events.list({
			calendarId: process.env.CAL_ID,
			timeMin: now,
			singleEvents: true,
			orderBy: "startTime",
		});

		const events = eventsResponse.data.items;
		console.log(`Found ${events.length} events.`);

		// Iterate through events and delete those with the key phrase in the summary or description
		for (const event of events) {
			if (
				(event.summary && event.summary.includes(keyPhrase)) ||
				(event.description && event.description.includes(keyPhrase))
			) {
				// Delete the event
				await calendar.events.delete({
					calendarId: process.env.CAL_ID,
					eventId: event.id,
				});
				console.log(
					`Deleted event with ID: ${event.id} and title: ${event.summary}`
				);
			}
		}

		return {
			success: true,
			message: `Events with key phrase "${keyPhrase}" deleted.`,
		};
	} catch (error) {
		console.error("Error fetching or deleting events:", error);
		return { success: false, error };
	}
};

module.exports = { deleteAll };
