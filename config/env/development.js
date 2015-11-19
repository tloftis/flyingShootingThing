'use strict';

module.exports = {
	db: process.env.MONGO_URL || 'mongodb://localhost/plane-game-dev',
	app: {
		title: 'FA Plane Game - Development Mode',
        description: 'Dev Mode for the Plane Game',
        keywords: 'FA, Plane, Game, Development'
	}
};
