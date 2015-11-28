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
    enemySpawnInterval,
    updatePlayerMv = {},
    shoot = {},
    gameRate = 25, //in Milliseconds
    playerMvVert = 5,
    playerMvHoz = 0.75,
    playerCnt = 0;

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
                    var oldPlayers = {};

                    for(var key in players)
                        oldPlayers[key] = players[key];

                    var player = {
                        currentTop: 50,
                        currentLeft: 10,
                        mvL: false,
                        mvR: false,
                        mvU: false,
                        mvD: false,
                        players: oldPlayers
                    };

                    for(var key in players)
                        players[key].players[id] = player;

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

        if(clients[client.handshake.address] === undefined)
            indivualClients(client); //I didn't want some if statement that just tabbed off the screen, so this worked well
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
        if(getRandomInt(1, 7) === 5 && enemies.length)
            createEMissle(enemies[getRandomInt(0, (enemies.length -1))]);

        //Send all players an update of all positions of bullets, players and enemies
        for(key in multiClients){
            player = players[key];

            var packet = {
                enemies: enemies,
                eMissles: eMissles,
                fMissles: fMissles
            };

            if(player){
                packet.players = Object.keys(player.players).map(function(key){
                    return {
                        currentTop: player.players[key].currentTop,
                        currentLeft: player.players[key].currentLeft
                    };
                });

                packet.player = {
                    currentTop: player.currentTop,
                    currentLeft: player.currentLeft
                }
            }else{
                packet.players = Object.keys(players).map(function(key){
                    return {
                        currentTop: players[key].currentTop,
                        currentLeft: players[key].currentLeft
                    };
                });

                packet.player = {
                    currentTop: -10,
                    currentLeft: -10
                }
            }

            multiClients[key].emit('multiplier-update', packet);
        }
    }, gameRate);
};

function removePlayer(id){
    playerCnt--;

    var client = multiClients[id];

    try{
        client.removeListener('control-movement', updatePlayerMv[id]);
    }catch(err){
        console.log(err);
    }

    try{
        client.removeListener('control-shoot', shoot[id]);
    }catch(err){
        console.log(err);
    }

    client.removeListener('start-game', startGame);

    delete players[id];

    for(var key in players)
        delete players[key].players[id];

    delete shoot[id];
    delete updatePlayerMv[id];
}

//Multiplier game
function startGame(){
    console.log('Attempting to Start Game');
    if(!enemySpawnInterval){
        console.log('Starting Game');

        enemySpawnInterval = setInterval(function(){
            if((enemies.length <= 10) && (getRandomInt(1, 6) === 5))
                createEnemy();
        }, 100);
    }
}

//Game Element creation functions
function createEnemy(){
    enemies.push({
        currentTop: getRandomInt(0, 100),
        currentLeft: 100,
        topDif: 0,
        dead: false
    });
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

//Randomizing functions for enemy movements and spawn rates
function getRandomInt(min, max) {
    if(min >= max) return min;
    return Math.floor(Math.random() * (++max - min) + min);
}

function getRandomFloat(min, max) {
    if(min >= max) return min;
    return Math.random() * (++max - min) + min;
}

//Game element Update Functions
function updateEnemy(enemy, index){
    enemy.currentLeft -= 0.75;

    var ran = getRandomInt(0, 15);

    if(ran === 3 || enemy.currentTop === 100)
        enemy.topDif -= getRandomFloat(0, 1);

    if(ran === 2 || enemy.currentTop === 0)
        enemy.topDif += getRandomFloat(0, 1);

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
    missle.currentLeft -= 1.5;

    if(missle.currentLeft < 0){
        eMissles.splice(index, 1);
    }else{
        var window = 2;

        for(var key in players){
            var player = players[key];

            if(( (player.currentLeft + window) > missle.currentLeft) && (player.currentLeft - window) < missle.currentLeft)
                if(( (player.currentTop + window) > missle.currentTop) && (player.currentTop - window) < missle.currentTop){
                    multiClients[key].emit('you-dead', {});
                    removePlayer(key);
                }
        }
    }
}

function updateFMissle(missle, index){
    missle.currentLeft += 1.5;

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
    if(enemySpawnInterval){ //This should already exist but since this isn't checked at any rate just check again to make sure
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
