'use strict';

/* globals moment: true */
/* jshint -W030 */

/**
 * Module dependencies.
 */
var winston = require('winston'),
    moment = require('moment');

var customLevels = {
    levels: {
        debug: 0,
        info: 1,
        warn: 2,
        error: 3
    },
    colors: {
        debug: 'green',
        info: 'blue',
        warn: 'yellow',
        error: 'red'
    }
};

winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {
    silent: (process.env.NODE_ENV === 'production'),
    level: 'debug',
    levels: customLevels.levels,
    colorize: true,
    timestamp: function () { return moment().format('YYYY-MM-DD HH:mm:ss.SSS'); },
    prettyPrint: true,
    handleExceptions: true
});

require('winston-mongodb').MongoDB;
winston.add(winston.transports.MongoDB, {
    name: 'mes-suite',
    silent: (!process.env.MONGO_LOG_TO_DB) || false,
    db: process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/plane-game',
    collection: 'log',
    storeHost: true,
    label: 'FA Plane Game Logs',
    level: 'info',
    capped: true,
    cappedSize: 10000000,
    handleExceptions: true
});

// make winston aware of your awesome colour choices
winston.addColors(customLevels.colors);
winston.emitErrs = true;

module.exports = winston;

module.exports.stream = {
    write: function(message, encoding){
        winston.log('debug', message);
    }
};