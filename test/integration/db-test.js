const expect = require('chai').expect;

const DbClient = require('../../src/db/client');
const DbModel = require('../../src/db/model');
const { Alerts } = require('../../src/constants');

const Helpers = require('../assets/helpers');

describe('DB Test Suite', function() {
	const dbConfig = {
		url: 'mongodb://localhost:27017',
		database: 'bitcoin'
	}
	let dbClient, dbModel, seedAlerts;

	before(function() {
		dbClient = new DbClient(dbConfig);

		return dbClient.connect()
			.then(() => {
				dbModel = dbClient.constructModel();
				return Helpers.seedAlerts(dbClient);
			})
			.then((alerts) => {
				seedAlerts = DbModel.translateIds(alerts);
			});
	});

	after(function() {
		return Helpers.clearAlerts(dbClient)
			.then(() => { return dbClient.disconnect(); });
	});

	it('should create DB indexes', function() {
		return dbModel.createIndexes();
	});

	it('should fetch an alert', function() {
		const alertToFetch = seedAlerts[0];

		// Try to fetch the first alert
		return dbModel.fetchAlert(alertToFetch.id)
			.then((alert) => {
				expect(alert).to.deep.equal(alertToFetch);
			})
	});

	it('should fetch all alerts', function() {
		return dbModel.fetchAlerts({})
			.then((alerts) => {
				expect(alerts.length).to.equal(seedAlerts.length);
			})
	});

	it('should fetch all triggered alerts', function() {
		const oldNewPairs = [
			[1.00, 7.00],
			[9.00, 3.00],
			[0.75, 10.00],
			[5.00, 5.00]
		];
		const fetchProms = oldNewPairs.map((pair) => {
			return dbModel.fetchTriggeredAlerts(...pair);
		});

		return Promise.all(fetchProms)
			.then((results) => {
				results.forEach((alerts, idx) => {
					const pair = oldNewPairs[idx];
					const matchingAlerts = Helpers.getTriggered(pair, seedAlerts);
					
					expect(Helpers.sortAlerts(alerts)).to.deep.equal(Helpers.sortAlerts(matchingAlerts));
				}); 
			});
	});

	it('should create an alert', function() {
		const newAlertData = {
			price: 11.00,
			direction: Alerts.Directions.UP,
			email: 'ian.james@gmail.com'
		};

		return dbModel.createAlert(newAlertData)
			.then((newAlert) => {
				expect(newAlert).to.include(newAlertData);
				expect(newAlert).to.have.property('id');
			});
	});

	it('should update an alert', function() {
		const alertToUpdate = seedAlerts[0];
		const updates = { price: 1.50, direction: Alerts.Directions.BOTH };
		const alteredAlert = Object.assign(alertToUpdate, updates);

		// Attempt to update the first alert
		return dbModel.updateAlert(alertToUpdate.id, updates)
			.then((updatedAlert) => {
				expect(updatedAlert).to.deep.equal(alteredAlert);
				return dbModel.fetchAlert(alertToUpdate.id);
			})
			.then((alert) => {
				expect(alert).to.deep.equal(alteredAlert);
			});
	});

	it('should delete an alert', function() {
		const alertToDelete = seedAlerts[0];

		// Attempt to delete the first alert
		return dbModel.deleteAlert(alertToDelete.id)
			.then((deletedAlert) => {
				expect(deletedAlert).to.deep.equal(alertToDelete);
				return dbModel.fetchAlert(alertToDelete.id);
			})
			.then((alert) => {
				expect(alert).to.be.null;
			});
	});	
});