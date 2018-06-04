const EmailNotifier = require('../src/price-monitor/notifier');

const email = process.argv[2];
// Ensure email is provided (interval is optional, as there's a default)
if (!email) {
	console.error('ERROR: Valid email address must be specified as the first argument (see README)\n');
	process.exit(0);
}

const config = {
	smtp: {
		host: 'smtp.mailgun.org',
		port: 587,
		auth: {
			user: 'bitcoin-api@mg.ianjt.com',
			pass: '3478139b-6db4-89b1-d1bc2ebaac2c'
		}
	},
	from: 'no-reply@mg.ianjt.com',
	subject: 'Bitcoin Price Alert'
};

const sampleAlert = {
	id: 'ba9dk329eks1',
	price: 2.50,
	direction: 'up',
	email
};

const notifier = new EmailNotifier(config);
const oldPrice = { rate: 2.50, time: 'Jun 4, 2018 01:20:00 UTC' };
const newPrice = { rate: 3.00, time: 'Jun 4, 2018 01:21:00 UTC' };

notifier.verifySmtp();
notifier.sendAlertEmail(sampleAlert, oldPrice, newPrice);
