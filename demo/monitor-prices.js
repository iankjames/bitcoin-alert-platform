const PriceMonitor = require('../src/price-monitor/monitor');
const PriceClient = require('../src/price-monitor/client');
const config = require('../config.json');

const Stubs = {
	dbModel: {
		fetchTriggeredAlerts(oldPrice, newPrice) {
			console.log(`Fetch triggered alerts for price change (\$${oldPrice} => \$${newPrice})`);
			return Promise.resolve([]);
		}
	},
	notifier: {
		notifyAlerts() {
			return Promise.resolve();
		}
	}
};

// Check if time interval was specified as a command-line arg (would override config)
const argInterval = Number.parseInt(process.argv[2]);

const { fromEmail, subject } = config.notifier;
const { bitcoinPriceUrl, intervalMs } = config.priceMonitor;
const interval = Number.isInteger(argInterval) ? argInterval : intervalMs;

// Construct + configure price monitoring components
const priceClient = new PriceClient({ priceUrl: bitcoinPriceUrl })
const monitor = new PriceMonitor(
	Stubs.dbModel, priceClient, Stubs.notifier, { intervalMs: interval }
);

// Kick-off price monitoring
monitor.start();
