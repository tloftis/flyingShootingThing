'use strict';

/**
 * Module dependencies.
 */
var glob = require('glob');

/**
 * Module init function.
 */
module.exports = function() {
	var files = glob.sync('./config/env/' + process.env.NODE_ENV + '.js');
	if (!files.length) {
		if (process.env.NODE_ENV) {
			console.error('\x1b[31m', 'No configuration file found for "' + process.env.NODE_ENV + '" environment using development instead\x1b[0m');
		} else {
			console.error('\x1b[31m', 'NODE_ENV is not defined! Using development environment\x1b[0m');
		}

		process.env.NODE_ENV = 'development';
	} else {
		console.log('\x1b[7m', 'Application loaded using the "' + process.env.NODE_ENV + '" environment configuration\x1b[0m');
	}

	require.extensions['.server.controller.js'] = require.extensions['.js'];
	require.extensions['.server.model.js'] = require.extensions['.js'];
	require.extensions['.server.routes.js'] = require.extensions['.js'];
};