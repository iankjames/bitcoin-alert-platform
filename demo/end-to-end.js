const got = require('got');

const Api = require('../src/api');
const PriceMonitor = require('../src/price-monitor');
const DemoPriceClient = require('./demo-price-client');
const DbClient = require('../src/db/client');
const { Alerts } = require('../src/constants');
const config = require('../config.json');

// Extract command-line args
const email = process.argv[2];
const interval = Number.parseInt(process.argv[3]);

// Ensure email is provided (interval is optional, as there's a default)
if (!email) {
	console.error('ERROR: Valid email address must be specified as the first argument (see README)\n');
	process.exit(0);
}

const { UP, DOWN, BOTH } = Alerts.Directions;
const alertUrl = `http://localhost:${config.api.port}/alerts`
const demoAlerts = [
	{ price: 6.50, direction: UP },
	{ price: 5.00, direction: BOTH },
	{ price: 3.00, direction: DOWN }
];

function launchApi(dbModel) {
	// Construct API server
	const api = Api(dbModel);

	// Kick-off API server/endpoints
	return new Promise((resolve) => {
		api.listen({ port: config.api.port }, () => {
			console.log(`API server listening on port ${config.api.port}`);
			resolve(api);
		});
	});
}

function launchMonitor(dbModel) {
	// Construct a demo price client to use in-place of the real/normal one
	const client = new DemoPriceClient();

	// Construct price monitoring agent
	const monitor = PriceMonitor(dbModel, config, { interval, client });

	// Kick-off price monitoring
	// TODO: Break-out/launch as separate node process (would be a long-running agent/worker)
	return monitor.start();
}

const dbClient = new DbClient(config.db);
let dbModel;

dbClient.connect()
	.then(() => {
		// Construct DB model + ensure indexes are created/exist
		dbModel = dbClient.constructModel();
		dbModel.createIndexes();

		return launchApi(dbModel);
	})
	.then(() => {
		// Make calls to the (now running) API to construct demo alerts
		const apiCalls = demoAlerts.map((alert) => {
			const opts = {
				method: 'POST',
				body: Object.assign({ email }, alert),
				json: true
			};

			return got(alertUrl, opts);
		});

		return Promise.all(apiCalls);
	})
	.then(() => {
		console.log('Demo alerts successfully created via the API');
		return launchMonitor(dbModel);
	})
	.catch((err) => {
		console.error(
		`Error starting Bitcoin alert platform: ${err}\nStack trace: ${err.stack}`);
	});

// TODO: Catch unhandled exceptions + promise rejections
