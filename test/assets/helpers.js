const testAlertData = require('./test-alert-data')();
const { Alerts } = require('../../src/constants');

const { UP, DOWN, BOTH } = Alerts.Directions;
const validDirs = {
	inc: [ UP, BOTH ],
	dec: [ DOWN, BOTH ]
};
const compById = (alert1, alert2) => {
	if (alert1.id < alert2.id) {
		return -1;
	}
	else if (alert1.id > alert2.id) {
		return 1;
	}
	else {
		return 0;
	}
};

module.exports = {
	seedAlerts(dbClient) {
		// Using DB driver directly to insert test data
		return dbClient._db.collection(Alerts.Key).insertMany(testAlertData)
			.then((res) => { return (res.ops || []); });
	},

	clearAlerts(dbClient) {
		return dbClient._db.collection(Alerts.Key).drop();
	},

	getTriggered([ oldPrice, newPrice ], alerts) {
		let triggered;
		
		if (oldPrice < newPrice) {
			triggered = alerts.filter((alert) => {
				const { price, direction } = alert;
				return (price > oldPrice) && (price <= newPrice) && validDirs.inc.includes(direction);
			});
		}
		else if (oldPrice > newPrice) {
			triggered = alerts.filter((alert) => {
				const { price, direction } = alert;
				return (price >= newPrice) && (price < oldPrice) && validDirs.dec.includes(direction);
			});
		}
		else {
			triggered = [];
		}

		return triggered;
	},

	sortAlerts(alerts) {
		return alerts.sort(compById);
	}
};