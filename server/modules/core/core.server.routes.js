'use strict';

module.exports = function(app) {
    var core = require('./core.server.controller');

    app.route('/').get(core.index);
};