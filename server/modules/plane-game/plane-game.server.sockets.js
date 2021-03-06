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
        width: 1,
        length: 2,
        speedHoz: 2,
        speedVert: 0,
        class: 'fa fa-ellipsis-h text-danger'
    },
    lightning: {
        name: 'Lightning Bolt',
        width: 1.5,
        length: 2,
        speedHoz: 2.5,
        speedVert: 0,
        class: 'fa fa-bolt text-warning fa-rotate-270'
    },
    lightningJumbo: {
        name: 'Super Lightning Bolt',
        width: 2.5,
        length: 4,
        speedHoz: 1.75,
        speedVert: 0,
        class: 'fa fa-bolt text-warning fa-rotate-270 fa-2x'
    },
    sawBlade: {
        name: 'Saw Blade',
        width: 2,
        length: 4,
        speedHoz: 1.35,
        speedVert: 0,
        class: 'fa fa-gear text-warning fa-spln'
    }
};

var enemyMissleConfig= {
    default: {
        name: 'Machine Gun',
        width: 1,
        length: 2,
        speedHoz: 2,
        speedVert: 0,
        class: 'fa fa-ellipsis-h text-danger'
    },
    lightning: {
        name: 'Lightning Bolt',
        width: 1.5,
        length: 2,
        speedHoz: 2.5,
        speedVert: 0,
        class: 'fa fa-bolt text-warning fa-rotate-90'
    },
    lightningJumbo: {
        name: 'Lightning Bolt',
        width: 2.5,
        length: 4,
        speedHoz: 2.25,
        speedVert: 0,
        class: 'fa fa-bolt text-warning fa-rotate-90 fa-2x'
    },
    blitzShot: {
        name: 'Blitz Shot',
        rounds: [
            {
                width: 2.5,
                length: 4,
                speedHoz: 1,
                speedVert: 1,
                class: 'fa fa-ellipsis-h text-warning fa-rotate-45'
            },{
                width: 2.5,
                length: 4,
                speedHoz: 1,
                speedVert: 0,
                class: 'fa fa-ellipsis-h text-warning'
            },{
                width: 2.5,
                length: 4,
                speedHoz: 1,
                speedVert: -1,
                class: 'fa fa-ellipsis-h text-warning fa-rotate-315'
            }
        ]
    }
};

var enemyConfig = {
    default: {
        speedVert: 0,
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
    blitzer: {
        spawnOdd: 2, //out of 100
        speedVert: 0,
        speedHoz: 0.5,
        ammoType: enemyMissleConfig.blitzShot,
        pointVal: 10,
        length: 2,
        width: 2,
        class: 'fa fa-plane fa-rotate-225'
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
            var id = client.handshake.address;

            clients[id] = client;

            client.on('disconnect', function () {
                delete clients[id]; //no disconnect means no re-connect, new sockets only

                if(multiClients[id]){
                    removePlayer(id);
                    delete multiClients[id];
                }
            });

            //Multiplier game
            client.on('join-multiplier', function (data) {
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
                        speedHoz: 0,
                        speedVert: 0,
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
                        player.speedHoz = data.hoz || 0;
                        player.speedVert = data.vert || 0;
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

        if(clients[client.handshake.address] === undefined) {
            individualClients(client); //I like the way this looked, so I went for it
        }
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
                enemies: arrayStripper(enemies),
                eMissles: arrayStripper(eMissles),
                fMissles: arrayStripper(fMissles),
                upgrads: arrayStripper(upgrads),
                highScore: highScore
            };

            if(player){
                packet.players = objectStripper(player.players);

                packet.player = {
                    currentTop: player.currentTop,
                    currentLeft: player.currentLeft,
                    template: player.equipment.ship.class + ' text-success',
                    score: player.score
                }
            }else{
                packet.players = objectStripper(players);

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
        console.error('Failed trying remove controls listener', err);
    }

    try{
        client.removeListener('control-shoot', shoot[id]);
    }catch(err){
        console.error('Failed trying remove shooting listener', err);
    }

    try{
        client.removeListener('good-bye', leaveMultiplayer[id]);
    }catch(err){
        console.error('Failed trying remove game exiting listener', err);
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
        ammoType: template.ammoType,
        pointVal: template.pointVal,
        length: template.length,
        width: template.width,
        speedHoz: template.speedHoz,
        speedVert: 0,
        template: template.class
    });
}

function createEMissle(enemy, template){
    if (enemy) {
        if (template.rounds) {
            for (var i = 0, roundLen = template.rounds.length; i < roundLen; i++) {
                createEMissle(enemy, template.rounds[i]);
            }
        } else {
            eMissles.push({
                currentLeft: enemy.currentLeft,
                currentTop: enemy.currentTop,
                length: template.length,
                width: template.width,
                speed: template.speedHoz,
                speedV: template.speedVert,
                template: template.class
            });
        }
    }
}

function createFMissle(player, template){
    if (player) {
        if (template.rounds) {
            for (var i = 0, roundLen = template.rounds.length; i < roundLen; i++) {
                createFMissle(player, template.rounds[i]);
            }
        } else {
            fMissles.push({
                currentLeft: player.currentLeft,
                currentTop: player.currentTop,
                length: template.length,
                width: template.width,
                speed: template.speedHoz,
                speedV: template.speedVert,
                template: template.class,
                id: player.id
            });
        }
    }
}

function createUpgrade(template){
    var containKey = '';
    var contains = {};
    var type = '';

    //Basically flipping a coin
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
        template: 'fa fa-star-o fa-spin text-warning '
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
    missle.currentTop -= missle.speedV;

    if (missle.currentLeft < 0 || missle.currentTop > 100 || missle.currentTop < 0) {
        eMissles.splice(index, 1);
    } else {
        var player = {}, mHW = 0, mHL = 0, pHW = 0, pHL = 0;

        for (var key in players) {
            player = players[key];
            mHW = missle.width / 2;
            mHL = missle.length / 2;
            pHW = player.equipment.ship.width / 2;
            pHL = player.equipment.ship.length / 2;

            if (( (player.currentLeft + pHL + mHW) > missle.currentLeft) && (player.currentLeft - pHL - mHW) < missle.currentLeft) {
                if (( (player.currentTop + pHW + mHW) > missle.currentTop) && (player.currentTop - pHW - mHW) < missle.currentTop) {
                    multiClients[key].emit('you-dead', {});
                    removePlayer(key);
                }
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
    missle.currentTop -= missle.speedV;

    if(missle.currentLeft > 100 || missle.currentTop > 100 || missle.currentTop < 0){
        fMissles.splice(index, 1);
    }else{
        var enemy = {}, mHW = 0, mHL = 0, eHW = 0, eHL = 0;

        for(var j =0; j< enemies.length; j++){
            enemy = enemies[j];
            mHW = missle.width/2;
            mHL = missle.length/2;
            eHW = enemy.width/2;
            eHL = enemy.length/2;

            if( ( (enemy.currentLeft + eHL + mHW) > missle.currentLeft) && (enemy.currentLeft - eHL - mHW) < missle.currentLeft){
                if( ( (enemy.currentTop + eHW + mHW) > missle.currentTop) && (enemy.currentTop - eHW - mHW) < missle.currentTop){
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

    player.currentLeft += ship.speedHoz * player.speedHoz;
    player.currentTop += ship.speedVert * player.speedVert;

    if(player.currentTop > 100)
        player.currentTop = 100;

    if(player.currentTop < 0)
        player.currentTop = 0;

    if(player.currentLeft > 100)
        player.currentLeft = 100;

    if(player.currentLeft < 0)
        player.currentLeft = 0;

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

function arrayStripper(array){
    var newArray = [];
    var i = 0, len = array.length, ele;

    for(i = 0; i < len; i++){
        ele = array[i];

        newArray[i] = {
            currentTop: ele.currentTop,
            currentLeft: ele.currentLeft,
            template: ele.template
        }
    }

    return newArray;
}

function objectStripper(obj){
    var newArray = [];
    var keyArray = Object.keys(obj);
    var i = 0, len = keyArray.length, ele;

    for(i = 0; i < len; i++){
        ele = obj[keyArray[i]];

        newArray[i] = {
            currentTop: ele.currentTop,
            currentLeft: ele.currentLeft,
            template: ele.equipment.ship.class
        }
    }

    return newArray;
}