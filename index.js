const Api = require('./src/api');
const PriceMonitor = require('./src/price-monitor');
const DbClient = require('./src/db/client');
const config = require('./config.json');

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
	// Construct price monitoring agent
	const monitor = PriceMonitor(dbModel, config);

	// Kick-off price monitoring
	// TODO: Break-out/launch as separate node process (would be a long-running agent/worker)
	return monitor.start();
}

const dbClient = new DbClient(config.db);

dbClient.connect()
	.then(() => {
		// Construct DB model + ensure indexes are created/exist
		const dbModel = dbClient.constructModel();
		dbModel.createIndexes();

		return Promise.all([
			launchApi(dbModel),
			launchMonitor(dbModel)
		]);
	})
	.catch((err) => {
		console.error(
		`Error starting Bitcoin alert platform: ${err}\nStack trace: ${err.stack}`);
	});

// TODO: Catch unhandled exceptions + promise rejections
