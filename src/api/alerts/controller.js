

// NOTE: A real API has more than one endpoint, and thus, would have many controllers
class AlertController {
	constructor(dbModel) {
		this._dbModel = dbModel;
	}

	getAlert(id) {
		return this._dbModel.fetchAlert(id);
	}

	getAlerts(filters) {
		const { price, direction, email } = filters || {};
		const extracted = { price, direction, email };
		const valid = {};

		// TODO: Implement more robust validation that is schema/entity driven
		Object.keys(extracted).forEach((key) => {
			const value = extracted[key];
			if (value) { valid[key] = value; }
		});
		
		return this._dbModel.fetchAlerts(valid);
	}

	createAlert(data) {
		const { price, direction, email } = data || {};
		
		// TODO: Implement more robust validation that is schema/entity driven
		if (price && direction && email) {
			return this._dbModel.createAlert({ price, direction, email });
		}
		else {
			return Promise.reject(
				new Error('Invalid request - alert creation requests must include at least on valid field')
			);
		}
	}

	updateAlert(id, data) {
		const { price, direction, email } = data || {};

		// TODO: Implement more robust validation that is schema/entity driven
		// NOTE: Technically ALL of these field must be present as it is a PUT
		// and not a PATCH request, but (for now) allow partial updates
		if (price || direction || email) {
			return this._dbModel.updateAlert(id, { price, direction, email });
		}
		else {
			return Promise.reject(
				new Error('Invalid request - alert update requests must include at least on valid field')
			);
		}
	}

	deleteAlert(id) {
		return this._dbModel.deleteAlert(id);
	}
}

module.exports = AlertController;