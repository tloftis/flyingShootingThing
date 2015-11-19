'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash');

/**
 * Extend user's controller
 */
module.exports = _.extend(
    require('./lib/users.authentication.server.controller.js'),
    require('./lib/users.authorization.server.controller.js'),
    require('./lib/users.password.server.controller.js'),
    require('./lib/users.profile.server.controller.js')
);
