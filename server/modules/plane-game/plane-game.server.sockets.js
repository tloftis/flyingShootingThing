'use strict';

/* globals log: true*/

/**
 * Module dependencies.
 */
var log = require('../../../config/logger'),
    mongoose = require('mongoose'),
    moment = require('moment'),
    _ = require('lodash'),
    async = require('async'),
    clients = {};

module.exports = function(io){
    var messages = [];

    io.on('connection', function (client) {
        function indivualClients(client, name){
            clients[client.handshake.address] = client;

            client.on('disconnect', function () {
                delete clients[client.handshake.address]; //no disconnect means no re-connect, new sockets only
            });

            //two functions used for testing data and IO Sockets
            client.on('chat', function (data) {
                for(var key in clients){
                    clients[key].emit('chat-get', {username: name, message: data});
                }
            });

            client.on('chat-setname', function (data) {
                name = data;
            });
        }

        if(clients[client.handshake.address] === undefined){
            indivualClients(client, 'Borg'); //separate out the client from the scope by calling a function instead
        }
    });
};