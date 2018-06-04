const express = require('express');

module.exports = function(controller) {
	const router = express.Router();

	// Bind alert routes
	router
		.get('/:id', function(req, res, next) {
			controller.getAlert(req.params.id)
				.then(function(alert) { res.json(alert); })
				.catch(next);
		})
		.get('/', function(req, res, next) {
			controller.getAlerts(req.query)
				.then(function(alerts) { res.json(alerts); })
				.catch(next);
		})
		.post('/', function(req, res, next) {
			controller.createAlert(req.body)
				.then(function(alert) { res.json(alert); })
				.catch(next);
		})
		.put('/:id', function(req, res, next) {
			controller.updateAlert(req.params.id, req.body)
				.then(function(alert) { res.json(alert); })
				.catch(next);
		})
		.delete('/:id', function(req, res, next) {
			controller.deleteAlert(req.params.id)
				.then(function(alert) { res.json(alert); })
				.catch(next);
		});

	return router;
};

