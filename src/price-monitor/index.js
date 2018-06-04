const PriceClient = require('./client');
const EmailNotifier = require('./notifier');
const PriceMonitor = require('./monitor');

module.exports = function(dbModel, config, args = {}) {
	// Extract price monitoring configuration
	const { smtp, from, subject } = config.notifier;
	const { bitcoinPriceUrl, intervalMs } = config.priceMonitor;
	const interval = Number.isInteger(args.interval) ? args.interval : intervalMs;

	// Construct + configure price monitoring components
	const priceClient = args.client || new PriceClient({ priceUrl: bitcoinPriceUrl });
	const notifier = new EmailNotifier({ smtp, from, subject });
	const monitor = new PriceMonitor(
		dbModel, priceClient, notifier, { intervalMs: interval }
	);

	return monitor;
};