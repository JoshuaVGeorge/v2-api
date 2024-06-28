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
			const durationInSeconds = result.duration_in_traffic
				? result.duration_in_traffic.value
				: result.duration.value;
			console.log(
				`Driving time from home to event (with traffic): ${durationInSeconds} seconds`
			);
			return durationInSeconds;
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
