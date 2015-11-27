'use strict';

/* globals async: true */
/* globals moment: true */

// Reports controller
angular.module('plane-game').controller('planeGameMultiController', ['$rootScope', '$scope', '$state', 'Alerts', '$location',
    function ($rootScope, $scope, $state, Alerts, $location) {
        console.log('Multi-player');

        $scope.playerMv = {};
        $scope.players = [];
        $scope.fMissles = [];
        $scope.enemies = [];
        $scope.eMissles = [];
        $scope.socket = $rootScope.socket;

        var field = angular.element(document.getElementsByName('planeparent'));
        var playerBaseClass = 'fa fa-plane fa-rotate-45 ';

        //Allow chat though the console
        window.chat = function(data){
            $scope.socket.emit('chat', data);
        };

        window.chatSetName = function(data){
            $scope.socket.emit('chat-setname', data);
        };
        
        $scope.init = function(){
            $scope.player = createPlayer();
            $scope.player.className += ' text-success';
        };

        $scope.socket.on('you-dead', function(data) {
            console.log('You\'ve been un-alived');
            updatePos($scope.player, {currentTop: -10, currentLeft: -10});
            //$scope.player.parentNode.removeChild($scope.player);
        });

        $scope.socket.on('multiplier-update', function(data) {
            //remove dead players, enemies, bullets
            while(data.eMissles.length < $scope.eMissles.length)
                removeEMissles($scope.eMissles[0], 0);

            while(data.fMissles.length < $scope.fMissles.length)
                removeFMissle($scope.fMissles[0], 0);

            while(data.enemies.length < $scope.enemies.length)
                removeEnemy($scope.enemies[0], 0);

            while(data.players.length < $scope.players.length)
                removePlayer($scope.players[0], 0);

            //add new enemies, bullets, players
            while(data.players.length > $scope.players.length)
                $scope.players.push(createPlayer());

            while(data.enemies.length > $scope.enemies.length)
                $scope.enemies.push(createEnemy());

            while(data.fMissles.length > $scope.fMissles.length)
                $scope.fMissles.push(createBody());

            while(data.eMissles.length > $scope.eMissles.length)
                $scope.eMissles.push(createEBody());

            //update movements
            var i = 0;
            for(i = 0; i < data.eMissles.length; i++)
                updatePos($scope.eMissles[i], data.eMissles[i]);

            for(i = 0; i < data.fMissles.length; i++)
                updatePos($scope.fMissles[i], data.fMissles[i]);

            for(i = 0; i < data.enemies.length; i++)
                updatePos($scope.enemies[i], data.enemies[i]);

            for(i = 0; i < data.players.length; i++)
                updatePos($scope.players[i], data.players[i]);

            if($scope.player)
                updatePos($scope.player, data.player);
        });

        //Element removal functions
        function removeFMissle(missle, index){
            if(missle.parentNode){
                missle.parentNode.removeChild(missle);
                $scope.fMissles.splice(index, 1);
            }
        }

        function removeEMissles(missle, index){
            if(missle.parentNode){
                missle.parentNode.removeChild(missle);
                $scope.eMissles.splice(index, 1);
            }
        }

        function removeEnemy(enemy, index){
            if(enemy.parentNode){
                enemy.parentNode.removeChild(enemy);
                $scope.enemies.splice(index, 1);
            }
        }

        function removePlayer(player, index){
            if(player.parentNode){
                player.parentNode.removeChild(player);
                $scope.players.splice(index, 1);
            }
        }

        //Element Position movement functions
        function updatePos(element, data){
            if(element.style){
                element.style.left = data.currentLeft + '%';
                element.style.top = data.currentTop + '%';
            }
        }

        //Element creation functions
        var createBody = function(){
            var missle = document.createElement("i");

            missle.className = 'fa fa-ellipsis-h';
            missle.style.position = 'absolute';
            missle.style.left = '-10%';
            missle.style.top = '-10%';

            field.append( missle);

            return missle;
        };

        var createEBody = function(){
            var missle = document.createElement("i");

            missle.className = 'fa fa-ellipsis-h text-danger';
            missle.style.position = 'absolute';
            missle.style.left = '-10%';
            missle.style.top = '-10%';

            field.append( missle);

            return missle;
        };

        var createEnemy = function(top, left){
            var enemy = document.createElement("i");

            enemy.className = 'fa fa-fighter-jet fa-rotate-180 text-muted';
            enemy.style.position = 'absolute';
            enemy.style.left = '-10%';
            enemy.style.top = '-10%';

            field.append( enemy);

            return enemy;
        };

        var createPlayer = function(){
            var player = document.createElement("i");

            player.className = playerBaseClass;
            player.style.position = 'absolute';
            player.style.left = '-10%';
            player.style.top = '-10%';

            field.append( player);

            return player;
        };

        //Control handling
        document.onclick = function() {
            $scope.socket.emit('control-shoot', {});
        };

        document.onkeydown = function(e){
            var evt = e || window.event;

            if(!evt.repeat){
                if(evt.keyCode === 40 || evt.keyCode === 83){
                    $scope.playerMv.mvD = true;
                    $scope.socket.emit('control-movement', $scope.playerMv);
                }
                if(evt.keyCode === 38 || evt.keyCode === 87){
                    $scope.playerMv.mvU = true;
                    $scope.socket.emit('control-movement', $scope.playerMv);
                }
                if(evt.keyCode === 37 || evt.keyCode === 65){
                    $scope.playerMv.mvR = true;
                    $scope.socket.emit('control-movement', $scope.playerMv);
                }
                if(evt.keyCode === 39 || evt.keyCode === 68){
                    $scope.playerMv.mvL = true;
                    $scope.socket.emit('control-movement', $scope.playerMv);
                }

                if(evt.keyCode === 32){
                    $scope.socket.emit('control-shoot', {});
                }
            }
        };

        document.onkeyup = function(e){
            var evt = e || window.event;

            if(!evt.repeat) {
                if(evt.keyCode === 40 || evt.keyCode === 83){
                    $scope.playerMv.mvD = false;
                    $scope.socket.emit('control-movement', $scope.playerMv);
                }
                if(evt.keyCode === 38 || evt.keyCode === 87){
                    $scope.playerMv.mvU = false;
                    $scope.socket.emit('control-movement', $scope.playerMv);
                }
                if(evt.keyCode === 37 || evt.keyCode === 65){
                    $scope.playerMv.mvR = false;
                    $scope.socket.emit('control-movement', $scope.playerMv);
                }
                if(evt.keyCode === 39 || evt.keyCode === 68){
                    $scope.playerMv.mvL = false;
                    $scope.socket.emit('control-movement', $scope.playerMv);
                }
            }
        };
    }
]);
