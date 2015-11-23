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

                players[multiClients[client.handshake.address].index].dead = true; //if player exist, remove it
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
                multiClients[client.handshake.address] = { client: clients[client.handshake.address], index: (players.push({ top: 50, left: 10 }) - 1)};
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

    var gameInterval = setInterval(function(){
        for(var i =0; i< enemies.length; i++){
            updateEnemy(enemies[i]);
        }

        for(var key in clients){
            multiClients[key].client.emit('multiplier-update', {username: name, message: data});
        }
    }, 50);
};

var fBullets = [],
    eBullets = [],
    enemies = [],
    players = [];

function addEnemy(){
    enemies.push({
        top: getRandomArbitrary(0, 100),
        left: 100,
        topDif: 0,
        dead: false
    })
}

function removePlayer(player){

}

function getRandomArbitrary(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function updateEnemy(enemy){
    enemy.left -= 1;

    var ran = getRandomArbitrary(0, 10);

    if(ran === 3){
        enemy.topDif -= getRandomArbitrary(1, 3);
    }

    if(ran === 2){
        enemy.topDif += getRandomArbitrary(1, 3);
    }

    if(ran > 8){
        eBullets.push({ top: enemy.top, left: enemy.left });
    }

    enemy.top += enemy.topDif;

    if(enemy.top < 0){
        enemy.top = 0;
    }

    if(enemy.top > 100){
        enemy.top = 100;
    }

    if((enemy.left < 0) || enemy.dead){
        enemy.element.parentNode.removeChild(enemy.element);
        $scope.enemies.splice(i, 1);
    }else{
        enemy.element.style.left = enemy.currentLeft + '%';
        enemy.element.style.top = enemy.currentTop + '%';
    }
}