const express = require('express');

// NOTE: In a larger API, we'd load controllers + routers more dynamically
const AlertController = require('./alerts/controller');
const AlertRouter = require('./alerts/router');


module.exports = function(dbModel) {
	const api = express();

	// Construct Alert controller + router
	const alertCtrl = new AlertController(dbModel);
	const alertRtr = AlertRouter(alertCtrl);

	// Register middleware to extract JSON + url-encoded request payloads
	// NOTE: I'd use the body-parser 3rd-party middleware for this parsing,
	// but it turns out they're built-in/native as of 4.16.x
	api.use(express.json());
	api.use(express.urlencoded({ extended: true }));

	// Register alert routes
	api.use('/alerts', alertRtr);

	// Generic catch-all error handler
	api.use(function(err, req, res, next) {
		res.status(500).json({ msg: 'An error occurred!' });

		if (err instanceof Error) {
			console.error(`Error occurred: ${err}\nStack trace: ${err.stack}`);
		}
		else {
			console.error(`Error occurred: ${err}`);
		}
	});

	return api;
};