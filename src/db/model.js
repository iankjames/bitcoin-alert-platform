const { Alerts } = require('../constants');
const { ObjectID } = require('mongodb');

const { UP, DOWN, BOTH } = Alerts.Directions;
const indexSpecs = [
	{ key: { price: 1 } },
	{ key: { email: 1 } },
	{ key: { price: 1, email: 1 }, unique: true }
];

class DbModel {
	constructor(db) {
		this._db = db;
	}

	static translateId(doc) {
		if (doc && doc._id) {
			// Translate database-provisioned ID to a string + change the ID key
			doc.id = (doc._id instanceof ObjectID) ? doc._id.toString() : `${doc._id}`;
			delete doc._id;
		}

		return doc;
	}

	static translateIds(docs) {
		if (Array.isArray(docs) && docs.length > 0) {
			docs.forEach(DbModel.translateId);
		}

		return docs;
	}

	createIndexes() {
		this._db.collection(Alerts.Key).createIndexes(indexSpecs);
	}

	fetchAlert(id) {
		const filter = { _id: new ObjectID(id) };
		const cursor = this._db.collection(Alerts.Key).find(filter).limit(1);

		return cursor.next()
			.then((alert) => { return DbModel.translateId(alert); });
	}

	// TODO: Add pagination, sort, etc.
	fetchAlerts(filters = {}) {
		// TODO: Validate filters
		const cursor = this._db.collection(Alerts.Key).find(filters);
		return cursor.toArray()
			.then((alerts) => { return DbModel.translateIds(alerts); });
	}

	fetchTriggeredAlerts(oldPrice, newPrice) {
		let filters;
		if (oldPrice < newPrice) {
			filters = {
				price: { $gt: oldPrice, $lte: newPrice },
				direction: { $in: [ UP, BOTH ] }
			};
		}
		else if (oldPrice > newPrice) {
			filters = {
				price: { $gte: newPrice, $lt: oldPrice },
				direction: { $in: [ DOWN, BOTH ] }
			};
		}
		else {
			// Skip the fetch - the price hasn't changed, therefore no alerts should be triggered
			return [];
		}

		return this.fetchAlerts(filters);
	}

	createAlert(data) {
		// TODO: Validate alert fields/data
		const result = this._db.collection(Alerts.Key).insertOne(data);
		return result.then((res) => {
			return res.ops && DbModel.translateId(res.ops[0]);
		});
	}

	updateAlert(id, data) {
		// TODO: Validate alert fields/data
		const filter = { _id: new ObjectID(id) };
		const updates = { $set: data };
		const opts = { returnOriginal: false };
		const result = this._db.collection(Alerts.Key).findOneAndUpdate(filter, updates, opts);
		
		return result.then((res) => { return DbModel.translateId(res.value); });
	}

	deleteAlert(id) {
		const filter = { _id: new ObjectID(id) };
		const result = this._db.collection(Alerts.Key).findOneAndDelete(filter);

		return result.then((res) => { return DbModel.translateId(res.value); });
	}
}

module.exports = DbModel;