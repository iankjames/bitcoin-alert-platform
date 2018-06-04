const nodemailer = require('nodemailer');

class EmailNotifier {
	constructor(config) {
		const { smtp, from,  subject } = config;
		this._smtp = smtp;
		this._from = from;
		this._subject = subject;

		this._transporter = nodemailer.createTransport(this._smtp);
	}

	verifySmtp() {
		// Verify that the SMTP connection is valid
		this._transporter.verify((err) => {
			if (err) {
				console.log(error);
			}
			else {
				console.log('SMTP server is ready to take messages');
			}
		});
	}

	_formatEmailMsg(alert, lastPrice, price) {
		const msg =
`A change in the price of Bitcoin has triggered your alert!

Old Price: \$${lastPrice.rate.toFixed(2)}
Time: ${lastPrice.time}

New Price: \$${price.rate.toFixed(2)}
Time: ${price.time}

Alert Details
Threshold Price: \$${alert.price.toFixed(2)}
Direction: ${alert.direction}
ID: ${alert.id}`;

		return msg;
	}

	notifyAlerts(alerts, lastPrice, price) {
		// Send email notifications in parallel
		const emailProms = alerts.map((alert) => {
			return this.sendAlertEmail(alert, lastPrice, price);
		});

		return Promise.all(emailProms);
	}

	sendAlertEmail(alert, lastPrice, price) {
		this._transporter.sendMail({
			from: this._from,
			to: alert.email,
			subject: 'Bitcoin Price Alert',
			text: this._formatEmailMsg(alert, lastPrice, price)
		}, (err, info) => {
			if (err) {
				console.error(
					`Failed to send alert email: ${err}\nAlert details: ${JSON.stringify(alert)}`
				);
			}
			else {
				console.log(
					`Alert email successfully sent to '${alert.email}' for alert ID '${alert.id}'\nInfo: ${JSON.stringify(info)}`
				);
			}
		});
	}
}

module.exports = EmailNotifier;