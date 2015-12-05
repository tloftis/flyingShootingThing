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
    upgrads = [],
    players = {},
    spawnInterval,
    updatePlayerMv = {},
    shoot = {},
    leaveMultiplayer = {},
    gameRate = 25, //in Milliseconds
    playerMvVert = 4,
    playerMvHoz = 0.75,
    playerCnt = 0;

var playerMissleConfig= {
    default: {
        name: 'Machine Gun',
        width: 1.5,
        length: 2,
        speed: 2,
        class: 'fa fa-ellipsis-h text-danger'
    },
    lightning: {
        name: 'Lightning Bolt',
        width: 2,
        length: 2,
        speed: 2.5,
        class: 'fa fa-bolt text-warning fa-rotate-270'
    },
    lightningJumbo: {
        name: 'Lightning Bolt',
        width: 3,
        length: 4,
        speed: 1.75,
        class: 'fa fa-bolt text-warning fa-rotate-270 fa-2x'
    }
};

var enemyMissleConfig= {
    default: {
        name: 'Machine Gun',
        width: 1.5,
        length: 2,
        speed: 2,
        class: 'fa fa-ellipsis-h text-danger'
    },
    lightning: {
        name: 'Lightning Bolt',
        width: 2,
        length: 2,
        speed: 2.5,
        class: 'fa fa-bolt text-warning fa-rotate-90'
    },
    lightningJumbo: {
        name: 'Lightning Bolt',
        width: 3,
        length: 4,
        speed: 2.25,
        class: 'fa fa-bolt text-warning fa-rotate-90 fa-2x'
    }
};

var enemyConfig = {
    default: {
        speedVert:0,
        speedHoz: 0.75,
        ammoType: enemyMissleConfig.default,
        pointVal: 5,
        length: 2,
        width: 2,
        class: 'fa fa-fighter-jet fa-rotate-180 text-muted'
    },
    rocket: {
        spawnOdd: 5, //out of 100
        speedVert: 0,
        speedHoz: 0.5,
        ammoType: enemyMissleConfig.lightning,
        pointVal: 10,
        length: 2,
        width: 2,
        class: 'fa fa-rocket fa-rotate-225 text-danger'
    },
    bigrocket: {
        spawnOdd: 2, //out of 100
        speedVert: 0,
        speedHoz: 0.35,
        ammoType: enemyMissleConfig.lightningJumbo,
        pointVal: 15,
        length: 3,
        width: 4,
        class: 'fa fa-space-shuttle fa-rotate-180 text-danger fa-2x'
    }
};

var playerShipConfig = {
    default: {
        speedVert: 4,
        speedHoz: 0.75,
        length: 2,
        width: 2,
        class: 'fa fa-plane fa-rotate-45'
    },
    jet: {
        speedVert:4.5,
        speedHoz: 0.95,
        length: 2,
        width: 2,
        class: 'fa fa-fighter-jet'
    },
    rocket: {
        speedVert: 4.75,
        speedHoz: 0.65,
        length: 2,
        width: 2,
        class: 'fa fa-rocket fa-rotate-45'
    },
    shuttle: {
        speedVert: 4,
        speedHoz: 1.05,
        length: 3,
        width: 4,
        class: 'fa fa-space-shuttle'
    }
};

var playerShipConfigArry = Object.keys(playerShipConfig);
var playerMissleConfigArry = Object.keys(playerMissleConfig);

//Randomizing functions for enemy movements and spawn rates, alot relies on these things
function getRandomInt(min, max) {
    if(min >= max) return min;
    return Math.floor(Math.random() * (++max - min) + min);
}

function getRandomFloat(min, max) {
    if(min >= max) return min;
    return Math.random() * (++max - min) + min;
}

module.exports = function(io){
    //Initialization and disconnection
    io.on('connection', function (client) {
        function individualClients(client){
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
                var id = client.handshake.address;

                if(!multiClients[id]){
                    multiClients[id] = client;

                    var oldPlayers = {};

                    //create a new object with the same keys as players and same object refrences
                    for(var key in players)
                        oldPlayers[key] = players[key];

                    //setup player with default values
                    var player = {
                        currentTop: 50,
                        currentLeft: 10,
                        mvL: false,
                        mvR: false,
                        mvU: false,
                        mvD: false,
                        shoot: false,
                        score: 0,
                        players: oldPlayers,
                        equipment: {
                            ammoType: playerMissleConfig.default,
                            ship: playerShipConfig.default
                        },
                        id: id
                    };

                    //Add new player to list of already existing players lsit
                    for(var key in players)
                        players[key].players[id] = player;

                    //Add player to list of players
                    playerCnt++;
                    players[id] = player;

                    //Multiplier game
                    updatePlayerMv[id] = function(data) {
                        player.mvL = data.mvL || false;
                        player.mvR = data.mvR || false;
                        player.mvU = data.mvU || false;
                        player.mvD = data.mvD || false;
                    };

                    //Set the player to shoot next update
                    shoot[id] = function() {
                        player.shoot = true;
                    };

                    //Remove the player, all listeners attach the them, and finally their client object
                    leaveMultiplayer[id] = function() {
                        removePlayer(id);
                        delete multiClients[id];
                    };

                    //Create listeners for player movements, actions and if they leave
                    client.on('control-movement', updatePlayerMv[id]);
                    client.on('control-shoot', shoot[id]);
                    client.on('good-bye', leaveMultiplayer[id]);
                    client.on('start-game', startGame);
                }
            });
        }

        if(clients[client.handshake.address] === undefined)
            individualClients(client); //I like the way this looked, so I went for it
    });

    var highScore = 0;

    //This dictates the update and movement rate of all things in game
    var gameInterval = setInterval(function(){
        //If no players then reset the game
        if(playerCnt === 0 && spawnInterval)
            restartGame();

        var i = 0,
            key,
            player,
            enemy;

        //updates the movements of all enemies
        for(i = 0; i < enemies.length; i++)
            updateEnemy(enemies[i], i);

        //updates the movements of all enemy bullets
        for(i = 0; i < eMissles.length; i++)
            updateEMissle(eMissles[i], i);

        //updates the movements of all friendly bullets
        for(i = 0; i < fMissles.length; i++)
            updateFMissle(fMissles[i], i);

        //updates the updates
        for(i = 0; i < upgrads.length; i++)
            updateUpgrade(upgrads[i], i);

        //updates all players movements
        for(key in players){
            player = players[key];
            updatePlayer(player, key);

            if(player.score > highScore)
                highScore = player.score;
        }

        //This makes enemies shoot, random enemy at random time
        if(getRandomInt(0, 10) === 5 && enemies.length)
            enemy = enemies[getRandomInt(0, (enemies.length -1))];
            if(enemy)
                createEMissle(enemy, enemy.ammoType);

        //Send all players an update of all positions of bullets, players and enemies
        for(key in multiClients){
            player = players[key];

            //strip all data except position from enemies, and missles
            var packet = {
                enemies: enemies.map(function(data){
                    return {
                        currentLeft: data.currentLeft,
                        currentTop: data.currentTop,
                        template: data.template
                    }
                }),
                eMissles: eMissles.map(function(data){
                    return {
                        currentLeft: data.currentLeft,
                        currentTop: data.currentTop,
                        template: data.template
                    }
                }),
                fMissles: fMissles.map(function(data){
                    return {
                        currentLeft: data.currentLeft,
                        currentTop: data.currentTop,
                        template: data.template
                    }
                }),
                upgrads: upgrads.map(function(data){
                    return {
                        currentLeft: data.currentLeft,
                        currentTop: data.currentTop,
                        template: data.template
                    }
                }),
                highScore: highScore
            };

            if(player){
                packet.players = Object.keys(player.players).map(function(key){
                    return {
                        currentTop: player.players[key].currentTop,
                        currentLeft: player.players[key].currentLeft,
                        template: player.players[key].equipment.ship.class
                    };
                });

                packet.player = {
                    currentTop: player.currentTop,
                    currentLeft: player.currentLeft,
                    template: player.equipment.ship.class + ' text-success',
                    score: player.score
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

    try{
        client.removeListener('good-bye', leaveMultiplayer[id]);
    }catch(err){
        console.log(err);
    }

    client.removeListener('start-game', startGame);

    delete players[id];
    playerCnt--;

    for(var key in players)
        delete players[key].players[id];

    delete shoot[id];
    delete updatePlayerMv[id];
    delete leaveMultiplayer[id];
}

//Multiplier game
function startGame(){
    console.log('Attempting to Start Game');
    if(!spawnInterval){
        console.log('Starting Game');

        spawnInterval = setInterval(function(){
            var ran = getRandomInt(1, 100);

            if((enemies.length <= 8) && (15 >= ran)) { // 1 in 10 chance of a enemy spawn
                var template = enemyConfig.default;

                for (var key in enemyConfig)
                    if (key !== 'default')
                        if (1 === getRandomInt(1, 100 / enemyConfig[key].spawnOdd))
                            template = enemyConfig[key];

                createEnemy(template);
            }

            if(ran === 1){
                createUpgrade();
                setTimeout(function() {if(upgrads.length) upgrads.shift(); }, 5000); //upgrades only last 5 seconds
            }
        }, 100);
    }
}

//Game Element creation functions
function createEnemy(template){
    enemies.push({
        currentTop: getRandomInt(0, 100),
        currentLeft: 100,
        dead: false,
        ammoType: template.ammoType || enemyConfig.default.ammoType,
        pointVal: template.pointVal || enemyConfig.default.pointVal,
        length: template.length || enemyConfig.default.length,
        width: template.width || enemyConfig.default.width,
        speedHoz: template.speedHoz || enemyConfig.default.speedHoz,
        speedVert: 0,
        template: template.class || enemyConfig.default.class
    });
}

function createEMissle(enemy, template){
    if(enemy)
        eMissles.push({
            currentLeft: enemy.currentLeft,
            currentTop: enemy.currentTop,
            length: template.length || enemyMissleConfig.default.length,
            width: template.width || enemyMissleConfig.default.width,
            speed: template.speed || enemyMissleConfig.default.speed,
            template: template.class || enemyMissleConfig.default.class
        });
}

function createFMissle(player, template){
    if(player)
        fMissles.push({
            currentLeft: player.currentLeft,
            currentTop: player.currentTop,
            length: template.length || enemyMissleConfig.default.length,
            width: template.width || enemyMissleConfig.default.width,
            speed: template.speed || enemyMissleConfig.default.speed,
            template: template.class || enemyMissleConfig.default.class,
            id: player.id
        });
}

function createUpgrade(template){
    var containKey = '';
    var contains = {};
    var type = '';

    if(getRandomInt(1,2) === 1){
        containKey = playerShipConfigArry[getRandomInt(0, (playerShipConfigArry.length - 1))];
        contains = playerShipConfig[containKey];
        type = 'ship';
    }else{
        containKey = playerMissleConfigArry[getRandomInt(0, (playerMissleConfigArry.length - 1))];
        contains = playerMissleConfig[containKey];
        type = 'ammoType';
    }

    upgrads.push({
        currentTop: getRandomFloat(0, 100),
        currentLeft: getRandomFloat(0, 100),
        contents: contains,
        type: type,
        length: 4,
        width: 4,
        template: 'fa fa-star-o fa-spin fa-pulse'
    });
}

//Game element Update Functions
function updateEnemy(enemy, index){
    enemy.currentLeft -= enemy.speedHoz;

    var ran = getRandomInt(0, 17);

    if(ran === 3 || enemy.currentTop === 100)
        enemy.speedVert -= getRandomFloat(0, 1);

    if(ran === 2 || enemy.currentTop === 0)
        enemy.speedVert += getRandomFloat(0, 1);

    //Shift up, down or not at all
    enemy.currentTop += enemy.speedVert;

    if(enemy.currentTop < 0)
        enemy.currentTop = 0;

    if(enemy.currentTop > 100)
        enemy.currentTop = 100;

    if((enemy.currentLeft < 0) || enemy.dead)
        enemies.splice(index, 1);
}

function updateEMissle(missle, index){
    missle.currentLeft -= missle.speed;

    if(missle.currentLeft < 0){
        eMissles.splice(index, 1);
    }else{
        var player = {};

        for(var key in players){
            player = players[key];

            if(( (player.currentLeft + missle.length/2) > missle.currentLeft) && (player.currentLeft - missle.length/2) < missle.currentLeft)
                if(( (player.currentTop + missle.width/2) > missle.currentTop) && (player.currentTop - missle.width/2) < missle.currentTop){
                    multiClients[key].emit('you-dead', {});
                    removePlayer(key);
                }
        }
    }
}

function updateUpgrade(upgrade, index){
    var player = {};

    for(var key in players){
        player = players[key];

        if(( (player.currentLeft + upgrade.length/2) > upgrade.currentLeft) && (player.currentLeft - upgrade.length/2) < upgrade.currentLeft)
            if(( (player.currentTop + upgrade.width/2) > upgrade.currentTop) && (player.currentTop - upgrade.width/2) < upgrade.currentTop){
                player.equipment[upgrade.type] = upgrade.contents;
                upgrads.splice(index, 1);
            }
    }
}

function updateFMissle(missle, index){
    missle.currentLeft += missle.speed;

    if(missle.currentLeft > 100){
        fMissles.splice(index, 1);
    }else{
        var enemy = {};

        for(var j =0; j< enemies.length; j++){
            enemy = enemies[j];

            if(( (enemy.currentLeft + missle.length/2) > missle.currentLeft) && (enemy.currentLeft - missle.length/2) < missle.currentLeft){
                if(( (enemy.currentTop + missle.width/2) > missle.currentTop) && (enemy.currentTop - missle.width/2) < missle.currentTop){
                    var player = players[missle.id];

                    if(player)
                        player.score += enemy.pointVal;

                    fMissles.splice(index, 1);
                    enemies.splice(j, 1);
                }
            }
        }
    }
}

function updatePlayer(player){
    var ship = player.equipment.ship;

    if(player.mvD){
        player.currentTop += ship.speedVert;
        if(player.currentTop > 100)
            player.currentTop = 100;
    }
    if(player.mvU){
        player.currentTop -= ship.speedVert;
        if(player.currentTop < 0)
            player.currentTop = 0;
    }
    if(player.mvL){
        if(player.currentLeft < 100)
            player.currentLeft += ship.speedHoz;
    }
    if(player.mvR){
        if(player.currentLeft > 0)
            player.currentLeft -= ship.speedHoz;
    }
    if(player.shoot){
        createFMissle(player, player.equipment.ammoType);
        player.shoot = false;
    }
}

function restartGame(){
    if(spawnInterval){ //This should already exist but since this isn't checked at any rate just check again to make sure
        clearInterval(spawnInterval);
        spawnInterval = undefined;
    }

    if(enemies.length || fMissles.length || eMissles.length){
        setTimeout(restartGame, 0); //adds it to the bottom of the list so it is non-blocking, process.nextTick adds it to the top and is blocking. cool
        return;
    }

    enemies = [];
    fMissles = [];
    eMissles = [];
    upgrads = [];

    blankPlayersField();
    multiClients = {};
    console.log('restarting game');
}

function blankPlayersField(){
    for(var key in multiClients) {
        multiClients[key].emit('multiplier-update', {
            enemies: [],
            eMissles: [],
            fMissles: [],
            players: [],
            player: {
                currentTop: -10,
                currentLeft: -10,
                score: 0
            }
        });
    }
}
