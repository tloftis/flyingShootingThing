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
    multiClients = {};


var fMissles = [],
    eMissles = [],
    enemies = [],
    players = {};

module.exports = function(io){
    var messages = [];

    //Initialization and disconnection
    io.on('connection', function (client) {
        function indivualClients(client, name){
            clients[client.handshake.address] = {client: client, name: name };

            client.on('disconnect', function () {
                delete clients[client.handshake.address]; //no disconnect means no re-connect, new sockets only

                if(multiClients[client.handshake.address]){
                    delete players[client.handshake.address]; //if player exist, remove it
                    delete multiClients[client.handshake.address]; //no disconnect means no re-connect, new sockets only
                }
            });

            //Chatting with the console
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
                console.log(client.handshake.address + ' Is Playing');
                multiClients[client.handshake.address] = client;
                var player = players[client.handshake.address] = {currentTop: 50, currentLeft: 10, mvL: false, mvR: false, mvU: false, mvD: false};

                //Multiplier game
                client.on('control-movement', function (data) {
                    console.log(client.handshake.address + 'reqest movement');
                    player.mvL = data.mvL || false;
                    player.mvR = data.mvR || false;
                    player.mvU = data.mvU || false;
                    player.mvD = data.mvD || false;
                });

                //Multiplier game
                client.on('control-shoot', function (data) {
                    console.log(client.handshake.address + 'request shooting');
                    createFMissle(player);
                });
            });
        }

        if(clients[client.handshake.address] === undefined){
            indivualClients(client, 'Borg'); //separate out the client from the scope by calling a function instead
        }
    });

    var gameInterval = setInterval(function(){
        var i = 0,
            key;

        for(i =0; i< enemies.length; i++){
            updateEnemy(enemies[i], i);
        }
        for(i =0; i< eMissles.length; i++){
            updateEMissle(eMissles[i], i);
        }
        for(i =0; i< fMissles.length; i++){
            updateFMissle(fMissles[i], i);
        }
        for(key in players){
            updatePlayer(players[key], key);
        }

        for(key in multiClients){
            multiClients[key].emit('multiplier-update', {enemies: enemies, eMissles: eMissles, fMissles: fMissles, players: players, player: players[key]});
        }
    }, 50);
};

function createEnemy(){
    enemies.push({
        currentTop: getRandomArbitrary(0, 100),
        currentLeft: 100,
        topDif: 0,
        dead: false
    })
}

function createEMissle(enemy){
    eMissles.push({
        currentLeft: enemy.currentLeft,
        currentTop: enemy.currentTop
    });
}

function createFMissle(player){
    fMissles.push({
        currentLeft: player.currentLeft,
        currentTop: player.currentTop
    });
}

function getRandomArbitrary(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function updateEnemy(enemy, index){
    enemy.currentLeft -= 1;

    var ran = getRandomArbitrary(0, 10);

    if(ran === 3){
        enemy.topDif -= getRandomArbitrary(1, 3);
    }

    if(ran === 2){
        enemy.topDif += getRandomArbitrary(1, 3);
    }

    if(ran > 8){
        eMissles.push({ currentTop: enemy.currentTop, currentLeft: enemy.currentLeft });
    }

    enemy.currentTop += enemy.topDif;

    if(enemy.currentTop < 0){
        enemy.currentTop = 0;
    }

    if(enemy.currentTop > 100){
        enemy.currentTop = 100;
    }

    if((enemy.currentLeft < 0) || enemy.dead){
        enemies.splice(index, 1);
    }
}

function updateEMissle(missle, index){
    missle.currentLeft -= 2;

    if(missle.currentLeft < 0){
        eMissles.splice(index, 1);
    }else{
        var window = 2;

        for(var key in players){
            var player = players[key];

            if(( (player.currentLeft + window) > miss.currentLeft) && (player.currentLeft - window) < missle.currentLeft){
                if(( (player.currentTop + window) > miss.currentTop) && (player.currentTop - window) < missle.currentTop){
                    multiClients[key].client.emit('you-dead', {});
                    delete multiClients[key];
                    delete players[key];
                }
            }
        }
    }
}

function updateFMissle(missle, index){
    missle.currentLeft += 2;

    if(missle.currentLeft > 100){
        fMissles.splice(index, 1);
    }else{
        var window = 2,
            enemy = {};

        for(var j =0; j< enemies.length; j++){
            enemy = enemies[j];

            if(( (enemy.currentLeft + window) > missle.currentLeft) && (enemy.currentLeft - window) < missle.currentLeft){
                if(( (enemy.currentTop + window) > missle.currentTop) && (enemy.currentTop - window) < missle.currentTop){
                    fMissles.splice(index, 1);
                }
            }
        }
    }
}

function updatePlayer(player){
    if(player.mvD){
        player.currentTop += 7;
        if(player.currentTop > 100)
            player.currentTop = 100;
    }
    if(player.mvU){
        player.currentTop -= 7;
        if(player.currentTop < 0)
            player.currentTop = 0;
    }
    if(player.mvL){
        if(player.currentLeft < 100)
            player.currentLeft += 0.5;
    }
    if(player.mvR){
        if(player.currentLeft > 0)
            player.currentLeft -= 0.5;
    }
}
