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
    clients = {},
    multiClients;

module.exports = function(io){
    var messages = [];

    //Initialization and disconnection
    io.on('connection', function (client) {
        function indivualClients(client, name){
            clients[client.handshake.address] = {client: client, name: name };

            client.on('disconnect', function () {
                delete clients[client.handshake.address]; //no disconnect means no re-connect, new sockets only
                delete multiClients[client.handshake.address]; //no disconnect means no re-connect, new sockets only
            });

            //Chating with the console
            client.on('chat', function (data) {
                for(var key in clients){
                    clients[key].client.emit('chat-get', {username: name, message: data});
                }
            });

            client.on('chat-setname', function (data) {
                name = data;
            });

            //Multiplier game
            client.on('join-multiplier', function (data) {
                players.push({ top: 50, left: 10 });
                multiClients[client.handshake.address] = clients[key];
            });

            //Multiplier game
            client.on('multiplier-die', function (data) {
                delete multiClients[client.handshake.address]; //no disconnect means no re-connect, new sockets only
            });
        }

        if(clients[client.handshake.address] === undefined){
            indivualClients(client, 'Borg'); //separate out the client from the scope by calling a function instead
        }
    });

    function getRandomArbitrary(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    }

    var fBullets = [],
        eBullets = [],
        enemies = [],
        players = [];

    function addEnem(){
        enemies.push({
            top: getRandomArbitrary(0, 100),
            left: 100,
            topDif: 0,
            dead: false
        })
    }

    var planeInterval = setInterval(function(){
        var enem = {};
        var ran = 0;

        for(var i =0; i< enemies.length; i++){
            enem =  enemies[i];
            enem.left -= 1;

            ran = getRandomArbitrary(0, 10);

            if(ran === 3){
                enem.topDif -= getRandomArbitrary(1, 3);
            }

            if(ran === 2){
                enem.topDif += getRandomArbitrary(1, 3);
            }

            if(ran > 8){
                eBullets.push({ top: enem.top, left: enem.left });
            }

            enem.top += enem.topDif;

            if(enem.top < 0){
                enem.top = 0;
            }

            if(enem.top > 100){
                enem.top = 100;
            }

            if((enem.left < 0) || enem.dead){
                enem.element.parentNode.removeChild(enem.element);
                $scope.enemies.splice(i, 1);
            }else{
                enem.element.style.left = enem.currentLeft + '%';
                enem.element.style.top = enem.currentTop + '%';
            }
        }

        for(var key in clients){
            multiClients[key].client.emit('multiplier-update', {username: name, message: data});
        }
    }, 50);
};