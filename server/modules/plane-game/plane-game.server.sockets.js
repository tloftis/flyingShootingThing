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
    players = {},
    gameRate = 25, //in Milliseconds
    playerMvVert = 5,
    playerMvHoz = 0.75,
    playerCnt = 0,
    enemySpawnInterval,
    updatePlayerMv = {},
    shoot = {};

module.exports = function(io){
    //Initialization and disconnection
    io.on('connection', function (client) {
        function indivualClients(client){
            clients[client.handshake.address] = client;

            client.on('disconnect', function () {
                delete clients[client.handshake.address]; //no disconnect means no re-connect, new sockets only

                if(multiClients[client.handshake.address]){
                    removePlayer(client.handshake.address);
                    delete multiClients[client.handshake.address];
                }
            });

            //Multiplier game
            client.on('join-multiplier', function (data) {
                playerCnt++;
                var id = client.handshake.address;

                if(!multiClients[id]){
                    multiClients[id] = client;

                    var player = {
                        currentTop: 50,
                        currentLeft: 10,
                        mvL: false,
                        mvR: false,
                        mvU: false,
                        mvD: false,
                        players: Object.keys(players).map(function(key){
                            return players[key];
                        })
                    };

                    for(var key in players)
                        players[key].players.push(player);

                    players[id] = player;

                    //Multiplier game
                    updatePlayerMv[id] = function(data) {
                        player.mvL = data.mvL || false;
                        player.mvR = data.mvR || false;
                        player.mvU = data.mvU || false;
                        player.mvD = data.mvD || false;
                    };

                    //Multiplier game
                    shoot[id] = function() {
                        createFMissle(player);
                    };

                    client.on('control-movement', updatePlayerMv[id]);
                    client.on('control-shoot', shoot[id]);
                    client.on('start-game', startGame);
                }
            });
        }

        if(clients[client.handshake.address] === undefined){
            indivualClients(client); //separate out the client from the scope by calling a function instead
        }
    });

    //This dictates the update and movement rate of all things in game
    var gameInterval = setInterval(function(){
        //If no players then reset the game
        if(playerCnt === 0 && enemySpawnInterval)
            restartGame();

        var i = 0,
            key,
            player;

        //updates the movements of all enemies
        for(i = 0; i < enemies.length; i++)
            updateEnemy(enemies[i], i);

        //updates the movements of all enemy bullets
        for(i = 0; i < eMissles.length; i++)
            updateEMissle(eMissles[i], i);

        //updates the movements of all friendly bullets
        for(i = 0; i < fMissles.length; i++)
            updateFMissle(fMissles[i], i);

        //updates all players movements
        for(key in players)
            updatePlayer(players[key], key);

        //This makes enemies shoot, random enemy at random time
        if(getRandomArbitrary(1, 7) === 5 && enemies.length)
            createEMissle(enemies[getRandomArbitrary(0, (enemies.length -1))]);

        //Send all players an update of all positions of bullets, players and enemies
        for(key in multiClients){
            player = players[key];
            if(player)
                multiClients[key].emit('multiplier-update', {
                    enemies: enemies,
                    eMissles: eMissles,
                    fMissles: fMissles,
                    players: Object.keys(player.players).map(function(key){
                        return {
                            currentTop: player.players[key].currentTop,
                            currentLeft: player.players[key].currentLeft
                        };
                    }),
                    player: {
                        currentTop: player.currentTop,
                        currentLeft: player.currentLeft
                    }
                });
        }
    }, gameRate);
};

function removePlayer(id){
    playerCnt--;
    delete players[id]; //if player exist, remove it

    var client = multiClients[id];
    client.removeListener('control-movement', updatePlayerMv[id]);
    client.removeListener('control-shoot', shoot[id]);
    client.removeListener('start-game', startGame);
}

//Multiplier game
function startGame(){
    console.log('Attempting to Start Game');
    if(!enemySpawnInterval){
        console.log('Starting Game');

        enemySpawnInterval = setInterval(function(){
            if((enemies.length <= 10) && ( getRandomArbitrary(1, 6) === 5))
                createEnemy();
        }, 100);
    }
}

function createEnemy(){
    enemies.push({
        currentTop: getRandomArbitrary(0, 100),
        currentLeft: 100,
        topDif: 0,
        dead: false
    })
}

function createEMissle(enemy){
    if(enemy)
        eMissles.push({
            currentLeft: enemy.currentLeft,
            currentTop: enemy.currentTop
        });
}

function createFMissle(player){
    if(player)
        fMissles.push({
            currentLeft: player.currentLeft,
            currentTop: player.currentTop
        });
}

function getRandomArbitrary(min, max) {
    if(min >= max) return min;
    return Math.floor(Math.random() * (++max - min) + min);
}

function updateEnemy(enemy, index){
    enemy.currentLeft -= 1;

    var ran = getRandomArbitrary(0, 15);

    if(ran === 3 || enemy.currentTop === 100)
        enemy.topDif -= getRandomArbitrary(1, 2);

    if(ran === 2 || enemy.currentTop === 0)
        enemy.topDif += getRandomArbitrary(1, 2);

    //Shift up, down or not at all
    enemy.currentTop += enemy.topDif;

    if(enemy.currentTop < 0)
        enemy.currentTop = 0;

    if(enemy.currentTop > 100)
        enemy.currentTop = 100;

    if((enemy.currentLeft < 0) || enemy.dead)
        enemies.splice(index, 1);
}

function updateEMissle(missle, index){
    missle.currentLeft -= 2;

    if(missle.currentLeft < 0){
        eMissles.splice(index, 1);
    }else{
        var window = 2;

        for(var key in players){
            var player = players[key];

            if(( (player.currentLeft + window) > missle.currentLeft) && (player.currentLeft - window) < missle.currentLeft){
                if(( (player.currentTop + window) > missle.currentTop) && (player.currentTop - window) < missle.currentTop){
                    multiClients[key].emit('you-dead', {});
                    removePlayer(key);
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
                    enemies.splice(j, 1);
                }
            }
        }
    }
}

function updatePlayer(player){
    if(player.mvD){
        player.currentTop += playerMvVert;
        if(player.currentTop > 100)
            player.currentTop = 100;
    }
    if(player.mvU){
        player.currentTop -= playerMvVert;
        if(player.currentTop < 0)
            player.currentTop = 0;
    }
    if(player.mvL){
        if(player.currentLeft < 100)
            player.currentLeft += playerMvHoz;
    }
    if(player.mvR){
        if(player.currentLeft > 0)
            player.currentLeft -= playerMvHoz;
    }
}

function restartGame(){
    if(enemySpawnInterval){
        clearInterval(enemySpawnInterval);
        enemySpawnInterval = undefined;
    }

    enemies = [];
    fMissles = [];
    eMissles = [];

    blankPlayersField();
    multiClients = {};
    console.log('restarting game');
}

function blankPlayersField(){
    //Send all players an update of all positions of bullets, players and enemies
    for(var key in multiClients) {
        console.log('Blanked ' + key + '\'s field');

        multiClients[key].emit('multiplier-update', {
            enemies: [],
            eMissles: [],
            fMissles: [],
            players: [],
            player: {
                currentTop: 0,
                currentLeft: 0
            }
        });
    }
}
