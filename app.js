'use strict';

var exit = require('exit');

// Logging initialization
process.on('uncaughtException', function(err) {
	console.error('Caught exception: ' + err);
	console.error('App Exited with a process.exit(1)', err.stack);
	exit(1);
});

require('./config/environment')();
require('./config/init')();

var config = require('./config/config'),
		mongoose = require('mongoose');

/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

// Bootstrap db connection
var db = mongoose.connect(config.db, function(err) {
	if (err) {
		console.error('\x1b[31m', 'Could not connect to MongoDB!');
		console.log(err);
	}
});

// Init the express application
var app = require('./config/express')(db);

// Bootstrap passport config
require('./config/passport')();

// Start the app by listening on <port>
if (typeof process.env.PORT !== 'undefined') {
	config.port = process.env.PORT;
}

app.listen(config.port);

// Expose app
module.exports = app;

require('./server/lib');

console.log('Server started on http://localhost:' + config.port);
