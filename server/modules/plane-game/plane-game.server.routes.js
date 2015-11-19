'use strict';

module.exports = function(app) {
    var planeGame = require('./plane-game.server.controller');

    app.route('/api/plane-game')
        .get(planeGame.planeGames);
};