const MIN_DELTA = 0.01; // Equivalent to one cent (USD)

class PriceMonitor {
	constructor(dbModel, client, notifier, config) {
		const { intervalMs } = config || {};

		this._dbModel = dbModel;
		this._notifier = notifier;
		this._client = client;
		this._intervalMs = intervalMs;
		this._intervalId = null;
		this._lastPrice = null;
	}

	triggerAlerts(price) {
		const delta = (price.rate - this._lastPrice.rate);

		if (Math.abs(delta) >= MIN_DELTA) {
			console.log(`Trigger alerts! (delta: ${delta})`);
			return this._dbModel.fetchTriggeredAlerts(this._lastPrice.rate, price.rate)
				.then((alerts) => {
					return this._notifier.notifyAlerts(alerts, this._lastPrice, price);
				});
		}
		else {
			// Change is smaller than the minimum delta...do NOT trigger alerts!
			console.log(`Price delta (${delta}) below minimum - skipping alerts`);
			return Promise.resolve();
		}
	}

	checkAndTrigger() {
		let newPrice;

		this._client.getCurrPrice()
			.then((price) => {
				newPrice = price;
				return this.triggerAlerts(price);
			})
			.then((price) => {
				this._lastPrice = newPrice;
			});
	}

	start() {
		if (!this._intervalId) {
			// Start by getting a baseline/initial price
			return this._client.getCurrPrice()
				.then((price) => {
					this._lastPrice = price;

					// Kick-off interval to check current price against the last, and handle alerts
					this._intervalId = setInterval(() => {
						console.log(`[${(new Date()).toTimeString()}] Monitor interval running...`);
						this.checkAndTrigger();
					}, this._intervalMs);
				})
				.catch((err) => {
					console.error('Unable to fetch initial price - monitor failed to start');
				});
		}
		else {
			return Promise.resolve('Monitor is already running...');
		} 
	}

	stop() {
		if (this._intervalId) {
			clearInterval(this._intervalId);
			this._intervalId = null;
		}
	}
}

module.exports = PriceMonitor;