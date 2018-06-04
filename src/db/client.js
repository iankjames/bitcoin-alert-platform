const { MongoClient } = require('mongodb');
const DbModel = require('./model');

class DbClient {
	constructor(config) {
		const { url, database } = config || {};
		this._url = url;
		this._database = database;

		this._client = null;
		this._db = null;
		this._connected = false;
	}

	connect() {
		if (this._connected) {
			return Promise.resolve();
		}

		console.log(`Connecting to DB at ${this._url}`);

    return MongoClient.connect(this._url, {})
      .then((client) => {
        console.log('Connected to DB!');

        this._client = client;
        this._db = client.db(this._database);
        this._connected = true;
      })
      .catch((err) => {
        console.error(`Unable to connect to MongoDB: ${err}`);
        throw err;
      });
	}

	disconnect() {
		if (this._connected && this._client) {
			return this._client.close();
		}
		else {
			return Promise.resolve();
		}
	}

	constructModel() {
		if (this._connected && this._db) {
			return new DbModel(this._db);
		}
		// else - handle this case more gracefully...
	}
}

module.exports = DbClient;