const { Client } = require("@googlemaps/google-maps-services-js");
require("dotenv").config();

const client = new Client({});

const calcTime = async (homeLocation, eventLocation, departureTime) => {
	try {
		const response = await client.distancematrix({
			params: {
				origins: [homeLocation],
				destinations: [eventLocation],
				mode: "driving",
				departure_time: departureTime,
				key: process.env.MAPS_API_KEY,
			},
		});

		const result = response.data.rows[0].elements[0];
		if (result.status === "OK") {
			const duration = result.duration.text;
			console.log(`Driving time from home to event: ${duration}`);
			return duration;
		} else {
			console.error("Error calculating driving time:", result.status);
			return null;
		}
	} catch (error) {
		console.error("Error calculating driving time:", error);
		return null;
	}
};

module.exports = {
	calcTime,
};
