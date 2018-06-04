const got = require('got');

class PriceClient {
	constructor(config) {
		const { priceUrl } = config || {};
		this._priceUrl = priceUrl;
	}

	parseRate(rate) {
		// Strip any non-numeric characters, then return parsed value
		const cleaned = rate.replace(/[^0-9\.]/g, '');
		return Number.parseFloat(cleaned);		
	}

	getCurrPrice() {
		return got(this._priceUrl, { json: true })
			.then((res) => {
				const { time, bpi } = res.body;
				const price = {
					time: time.updated,
					rate: this.parseRate(bpi.USD.rate)
				};

				console.log(`New price fetched: ${JSON.stringify(price)}`);
				return price;
			})
			.catch((err) => {
				console.error('Error fetching current bitcoin price!');
			});
	}
}

module.exports = PriceClient;