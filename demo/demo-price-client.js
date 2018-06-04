const prices = [ 5.00, 7.00, 6.00, 4.00, 2.50, 0.75, 3.00 ];

class DemoPriceClient {
	constructor() {
		this._nextPriceIdx = 0;
	}

	_getNextPrice() {
		if (this._nextPriceIdx < 0 || this._nextPriceIdx >= prices.length) {
			this._nextPriceIdx = 0;
		}

		const price = prices[this._nextPriceIdx];
		this._nextPriceIdx++;

		return price;
	}

	getCurrPrice() {
		const price = {
			time: Date(),
			rate: this._getNextPrice()
		};

		console.log(`New price fetched: ${JSON.stringify(price)}`);
		return Promise.resolve(price);
	}
}

module.exports = DemoPriceClient;