'use strict';

module.exports = function(app) {
    var chat = require('./chat.server.controller');

    app.route('/api/chat/names')
        .get(chat.getNames);
};