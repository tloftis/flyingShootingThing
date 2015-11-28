'use strict';

/* globals async: true */
/* globals moment: true */

// Reports controller
angular.module('plane-game').controller('planeGameMultiController', ['socketService', '$scope', '$state', 'Alerts', '$location',
    function (socketService, $scope, $state, Alerts, $location) {
        console.log('Multi-player');

        $scope.players = [];
        $scope.enemies = [];
        $scope.fMissles = [];
        $scope.eMissles = [];
        $scope.average = 0;
        $scope.socket = socketService;
        $scope.playerData = {score: 0};
        $scope.highScore = 0;

        $scope.init = function(){
            $scope.player = createPlayer();
            $scope.player.className += ' text-success';
        };

        $scope.socket.on('you-dead', playerDeath);
        $scope.socket.on('multiplier-update', updateElements);

        //Disconnect when the view is clicked off of
        $scope.$on('$destroy', function() {
            $scope.socket.removeListener('you-dead', playerDeath);
            $scope.socket.removeListener('multiplier-update', updateElements);
            $scope.socket.emit('good-bye', {});
        });

        //Allow chat though the console
        window.chat = function(data){
            $scope.socket.emit('chat', data);
        };

        window.chatSetName = function(data){
            $scope.socket.emit('chat-setname', data);
        };

        var start = (new Date()).getMilliseconds(),
            averages = [],
            time = 0,
            diff = 0,
            field = angular.element(document.getElementsByName('planeparent'));

        var playerMv = {};

        function updateElements(data) {
            diff = (new Date()).getMilliseconds() - start;

            if(diff > 0)
                averages.push(diff);

            start = (new Date()).getMilliseconds();

            if(averages.length > 1000) averages.shift();

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

            time = 0;
            for(i = 0; i < averages.length; i++){
                time += averages[i];
            }

            $scope.$apply(function(){
                $scope.average = time/averages.length;
                if(data.player.score)
                    $scope.playerData = data.player;
                $scope.highScore = data.highScore || $scope.highScore;
            });
        };

        function playerDeath(data){
            console.log('You dead');
        }

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
            console.log('Removing Player');
            if(player.parentNode){
                player.parentNode.removeChild(player);
                $scope.players.splice(index, 1);
                console.log('Removed');
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

            player.className = 'fa fa-plane fa-rotate-45';
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
                    playerMv.mvD = true;
                    $scope.socket.emit('control-movement', playerMv);
                }
                if(evt.keyCode === 38 || evt.keyCode === 87){
                    playerMv.mvU = true;
                    $scope.socket.emit('control-movement', playerMv);
                }
                if(evt.keyCode === 37 || evt.keyCode === 65){
                    playerMv.mvR = true;
                    $scope.socket.emit('control-movement', playerMv);
                }
                if(evt.keyCode === 39 || evt.keyCode === 68){
                    playerMv.mvL = true;
                    $scope.socket.emit('control-movement', playerMv);
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
                    playerMv.mvD = false;
                    $scope.socket.emit('control-movement', playerMv);
                }
                if(evt.keyCode === 38 || evt.keyCode === 87){
                    playerMv.mvU = false;
                    $scope.socket.emit('control-movement', playerMv);
                }
                if(evt.keyCode === 37 || evt.keyCode === 65){
                    playerMv.mvR = false;
                    $scope.socket.emit('control-movement', playerMv);
                }
                if(evt.keyCode === 39 || evt.keyCode === 68){
                    playerMv.mvL = false;
                    $scope.socket.emit('control-movement', playerMv);
                }
            }
        };
    }
]);
