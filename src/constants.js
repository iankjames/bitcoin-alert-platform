const deepFreeze = require('deep-freeze');

module.exports = deepFreeze({
	Alerts: {
		Directions: {
			UP: 'up',
			DOWN: 'down',
			BOTH: 'both'
		},
		Key: 'alerts'
	}
});