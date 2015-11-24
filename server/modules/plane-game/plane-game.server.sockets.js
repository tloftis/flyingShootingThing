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


var fBullets = [],
    eBullets = [],
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
                multiClients[client.handshake.address] = { client: clients[client.handshake.address], playerId: client.handshake.address };
                var player = players[client.handshake.address] = {top: 50, left: 10, mvL: false, mvR: false, mvU: false, mvD: false};

                //Multiplier game
                client.on('control-movement', function (data) {
                    player.mvL = data.mvL || false;
                    player.mvR = data.mvR || false;
                    player.mvU = data.mvU || false;
                    player.mvD = data.mvD || false;
                });
            });
        }

        if(clients[client.handshake.address] === undefined){
            indivualClients(client, 'Borg'); //separate out the client from the scope by calling a function instead
        }
    });

    var gameInterval = setInterval(function(){
        var i = 0
        for(i =0; i< enemies.length; i++){
            updateEnemy(enemies[i], i);
        }
        for(i =0; i< eBullets.length; i++){
            updateEMissle(eBullets[i], i);
        }
        for(i =0; i< fBullets.length; i++){
            updateFMissle(fBullets[i], i);
        }
        for(i =0; i< eBullets.length; i++){
            updateEMissle(eBullets[i], i);
        }

        for(var key in clients){
            multiClients[key].client.emit('multiplier-update', {username: name, message: data});
        }
    }, 50);
};

function addEnemy(){
    enemies.push({
        top: getRandomArbitrary(0, 100),
        left: 100,
        topDif: 0,
        dead: false
    })
}

function createEMissle(enemy){
    $scope.eMissles.push({
        currentLeft: enemy.currentLeft,
        currentTop: enemy.currentTop,
        element: document.createElement("i")
    });
}

function createFMissle(player){
    $scope.fBullets.push({
        currentLeft: enemy.currentLeft,
        currentTop: enemy.currentTop,
        element: document.createElement("i")
    });
}

function getRandomArbitrary(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function updateEnemy(enemy, index){
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
        enemies.splice(index, 1);
    }else{
        enemy.element.style.left = enemy.currentLeft + '%';
        enemy.element.style.top = enemy.currentTop + '%';
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
        $scope.fMissles.splice(index, 1);
    }else{
        var window = 2,
            enemy = {};

        for(var j =0; j< enemies.length; j++){
            enemy = enemies[j];

            if(( (enemy.currentLeft + window) > missle.currentLeft) && (enemy.currentLeft - window) < missle.currentLeft){
                if(( (enemy.currentTop + window) > missle.currentTop) && (enemy.currentTop - window) < missle.currentTop){
                    $scope.fMissles.splice(index, 1);
                }
            }
        }
    }
}

function updatePlayer(player){
    if(moveDown){
        player.currentTop += 7;
        if(player.currentTop > 100)
            player.currentTop = 100;
    }
    if(moveUp){
        player.currentTop -= 7;
        if(player.currentTop < 0)
            player.currentTop = 0;
    }
    if(moveLeft){
        if(player.currentLeft < 100)
            player.currentLeft += 0.5;
    }
    if(moveRight){
        if(player.currentLeft > 0)
            player.currentLeft -= 0.5;
    }
}
