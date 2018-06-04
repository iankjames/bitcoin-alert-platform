const testAlertData = [
	{
		price: 2.00,
		"direction": "up",
		"email": "peter.jenkins@gmail.com"
	},
	{
		"price": 5.00,
		"direction": "both",
		"email": "rachel.goodman@msn.com"
	},
	{
		"price": 3.00,
		"direction": "down",
		"email": "jackie.elway@yahoo.com"
	},
	{
		"price": 7.00,
		"direction": "both",
		"email": "james.roth@gmail.com"
	},
	{
		"price": 1.00,
		"direction": "up",
		"email": "hank.sterling@oath.com"
	},
	{
		"price": 9.00,
		"direction": "down",
		"email": "deborah.saxon@comcast.net"
	},
	{
		"price": 8.00,
		"direction": "up",
		"email": "holly.burton@gmail.com"
	}
];

module.exports = function() {
	// Ensure that every usage (require or import) of this data provides a distinct copy  
	return JSON.parse(JSON.stringify(testAlertData));
}