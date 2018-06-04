const expect = require('chai').expect;
const got = require('got');

const Api = require('../../src/api');
const DbClient = require('../../src/db/client');
const DbModel = require('../../src/db/model');
const { Alerts } = require('../../src/constants');

const Helpers = require('../assets/helpers');

describe('API Test Suite', function() {
	const config = {
		port: 3000,
		db: {
			url: 'mongodb://localhost:27017',
			database: 'bitcoin'
		}
	}
	const alertUrl = `http://localhost:${config.port}/alerts`
	let dbClient, dbModel;

	before(function() {
		dbClient = new DbClient(config.db);
		
		return dbClient.connect()
			.then(() => {
				dbModel = dbClient.constructModel();
				return Helpers.seedAlerts(dbClient);
			})
			.then((alerts) => {
				seedAlerts = DbModel.translateIds(alerts);

				// Construct API server
				const api = Api(dbModel);

				// Kick-off API server/endpoints
				return new Promise((resolve, reject) => {
					api.listen({ port: config.port }, resolve);
				});
			});
	});

	after(function() {
		return Helpers.clearAlerts(dbClient)
			.then(() => { return dbClient.disconnect(); });
	});

	it('should retrieve the alert with the provided ID', function() {
		const alertToFetch = seedAlerts[0];

		return got(`${alertUrl}/${alertToFetch.id}`, { json: true })
			.then((res) => {
				const alert = res.body;
				expect(alert).to.deep.equal(alertToFetch);
			});
	});

	it('should retrieve alerts that match provided args', function() {
		const filters = { direction: Alerts.Directions.UP };
		const opts = {
			query: filters,
			json: true
		};

		// Determine number of alerts that match the filters
		const matchCt = seedAlerts.reduce((ct, alert) => {
			if (alert.direction === filters.direction) { ct++; }
			return ct;
		}, 0);

		return got(alertUrl, opts)
			.then((res) => {
				const alerts = res.body;
				const allMatchFilters = alerts.every((alert) => {
					return alert.direction === filters.direction;
				});

				expect(allMatchFilters).to.be.true;
				expect(alerts.length).to.equal(matchCt);
			});
	});

	it('should create a new alert', function() {
		const newAlertData = {
			price: 11.00,
			direction: Alerts.Directions.UP,
			email: 'ian.james@gmail.com'
		};
		const opts = {
			method: 'POST',
			body: newAlertData,
			json: true
		};

		return got(alertUrl, opts)
			.then((res) => {
				const newAlert = res.body;
				expect(newAlert).to.include(newAlertData);
				expect(newAlert).to.have.property('id');

				return got(`${alertUrl}/${newAlert.id}`, { json: true });
			})
			.then((res) => {
				const alert = res.body;
				expect(alert).to.include(newAlertData);
			});
	});

	it('should update the alert with the provided ID', function() {
		const alertToUpdate = seedAlerts[0];
		const updates = { price: 1.50, direction: 'both' };
		const alteredAlert = Object.assign(alertToUpdate, updates);
		const opts = {
			method: 'PUT',
			body: alteredAlert,
			json: true
		};

		return got(`${alertUrl}/${alertToUpdate.id}`, opts)
			.then((res) => {
				const updatedAlert = res.body;
				expect(updatedAlert).to.deep.equal(alteredAlert);

				return got(`${alertUrl}/${updatedAlert.id}`, { json: true });
			})
			.then((res) => {
				const alert = res.body;
				expect(alert).to.deep.equal(alteredAlert);
			});
	});

	it('should delete the alert with the provided ID', function() {
		const alertToDelete = seedAlerts[0];
		const opts = {
			method: 'DELETE',
			json: true
		};

		return got(`${alertUrl}/${alertToDelete.id}`, opts)
			.then((res) => {
				const deletedAlert = res.body;
				expect(deletedAlert).to.deep.equal(alertToDelete);

				return got(`${alertUrl}/${alertToDelete.id}`, { json: true });
			})
			.then((res) => {
				const alert = res.body;
				expect(alert).to.be.null;
			});
	});
});