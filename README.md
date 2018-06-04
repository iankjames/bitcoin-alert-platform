# Bitcoin Alert API
Simple API that allows users to configure USD/Bitcoin exchange rate update alerts that result in notifications (via email). 

## API Endpoints

#### GET /alerts/:id

#### GET /alerts
Query string args can be (optionally) specified in order to filter the set of alerts that are fetched (see __POST__ notes for valid fields) -- otherwise, all alerts are returned.

#### POST /alerts
Expects a JSON _or_ url-encoded payload of the following format:
```javascript
{
  price: <float>
  direction <string> // Valid options set: {'up', 'down', 'both'}
  email: <string>
}
```

#### PUT /alerts/:id
Expects a JSON _or_ url-encoded payload of the format specified above (see __POST__ notes).

#### DELETE /alerts/:id

## Demos

### Price Alert Email
`npm run email-demo [-- <email>]`

Sends a price alert email to the provided address, using dummy data.

### Price Monitor
`npm run price-demo [-- <intervalMs>]`

Provides a simple demo of the price monitor, checking the USD/bitcoin rate at the specified interval in milliseconds (default in `config.js` is used, otherwise).

__NOTE:__ This demo will _not_ attempt to fetch any alerts (and thus, will not send any email notifications).

### End-to-End
`npm run full-demo [-- <email> <intervalMs>]`

Will spin-up the API, and kick-off the price monitor to check the USD/bitcoin rate at the specified interval in milliseconds (default in `config.js` is used, otherwise) -- unlike the price monitor demo, it will fetch fake prices from a sequence that will repeat/cycle indefinitely.  It will then set alerts (making actual calls to the running API) that are associated with the provided email address -- these alerts are ensured to trigger at some point (depends on interval value), and should result in the appropriate console logging + actual delivery of email notification(s).

## Testing
Simply run `npm test` to execute a collection of integration tests that cover the API + data/DB functionality.

__NOTE:__ Docker _must_ be installed locally in order for the test suite to be able to be run (see: [Installing Docker](https://docs.docker.com/install/)).

## Run Locally
Executing `npm run local` will spin-up the entire platform (API + Price monitor) using the `config.json` file located in the top-level directory.  Additionally, it will spin-up an DB server (currently, this project uses MongoDB exclusively) running in a local container exposed via _localhost_ on the standard port (27017) – it's important to ensure the config is set to this info for the DB parameters!

The actual Bitcoin/USD exchange rate will be fetched at the config-driven interval, checking all existing alerts (which are created via `curl` or any other HTTP client calls to the locally running API) to see if any should result in tiggering email notifications.

## Caveats
This application sends email via an SMTP server specified in the main config file.  The current credentials present are connected to Mailgun's STMP server, and is configured for a sending domain I provisioned (mg.ianjt.com).  This config can be easily updated to the host, port, and credentials for any other SMTP server, as long as the keys and object shape remain intact.

### What I'd change/add with more time...
* The API and the price monitoring components should run as separate daemons (e.g., separate node.js processes)
* Pagination, sorting, and everything else that is expected from a standard RESTful API
