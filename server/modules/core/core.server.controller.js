'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    _ = require('lodash'),
    net = require('net'),
    ipaddr = require('ipaddr.js'),
    log = require('../../../config/logger');

exports.index = function(req, res) {
    //if IPv6, convert to IPv4
    var clientIp = req.ip;
    if (net.isIP(clientIp) === 6) {
        clientIp = ipaddr.process(clientIp).toString();
    }

    res.render('index', {
        user: req.user || null,
        clientIp: clientIp || null
    });

};
