'use strict';
var passport = require('passport');

module.exports = function(app) {
    var freak = require('./freak.server.controller');

    app.route('/api/freak/update')
        .get(freak.updateCasts);

    app.route('/api/freak/list')
        .get(freak.listCasts);
};