const express = require("express");
const { google } = require("googleapis");
const { ensureAuthenticated } = require("../controller/authController");

const router = express.Router();

router.post("/", ensureAuthenticated, async (req, res) => {
	console.log("Received notification:", req.body);
	// Process the notification (e.g., retrieve the event details)
	res.status(200).send("OK");
});

module.exports = router;
