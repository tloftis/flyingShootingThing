'use strict';

/* globals async: true */
/* globals moment: true */

// Reports controller
angular.module('plane-game').controller('planeGameMultiController', ['$scope', '$state', 'Alerts', '$location',
    function ($scope, $state, Alerts, $location) {
        console.log('Multi player');
        $scope.players = [];
        $scope.fMissles = [];
        $scope.enemies = [];
        $scope.eMissles = [];

        var hostUrl = $location.$$protocol + '://' + $location.$$host + ':' + $location.$$port;
        $scope.socket = io(hostUrl,{ 'forceNew':true });

        //Disconnect when the view is clicked off of
        $scope.$on('$destroy', function() {
            $scope.socket.io.disconnect();
        });

        window.chat = function(data){
            $scope.socket.emit('chat', data);
        };

        window.chatSetName = function(data){
            $scope.socket.emit('chat-setname', data);
        };

        $scope.socket.on('chat-get', function(data) {
            console.log(data.username + ' : ' + data.message);
        });

        $scope.socket.on('you-dead', function(data) {
            console.log('You\'ve been un-alived');
        });

        $scope.socket.on('multiplier-update', function(data) {
            data.players = Object.keys(data.players).map(function(key){ return( data.players[key] ); });

            //remove dead players, enemies, bullets
            while(data.eMissles.length < $scope.eMissles.length){
                $scope.eMissles[0].parentNode.removeChild($scope.eMissles[0]);
                $scope.eMissles.shift();
            }
            while(data.fMissles.length < $scope.fMissles.length){
                $scope.fMissles[0].parentNode.removeChild($scope.fMissles[0]);
                $scope.fMissles.shift();
            }
            while(data.enemies.length < $scope.enemies.length){
                $scope.enemies[0].parentNode.removeChild($scope.enemies[0]);
                $scope.enemies.shift();
            }
            while(data.players.length < $scope.players.length){
                $scope.players[0].parentNode.removeChild($scope.players[0]);
                $scope.players.shift();
            }

            //add new enemies, bullets, players
            while(data.players.length > $scope.players.length){
                $scope.createPlayer();
            }
            while(data.enemies.length > $scope.enemies.length){
                $scope.createEnemy();
            }
            while(data.fMissles.length > $scope.fMissles.length){
                $scope.createBody();
            }
            while(data.eMissles.length > $scope.eMissles.length){
                $scope.createEBody();
            }

            //update movements
            var i = 0;
            for(i = 0; i < data.eMissles.length; i++){
                $scope.eMissles[i].style.left = data.eMissles[i].currentLeft + '%';
                $scope.eMissles[i].style.top = data.eMissles[i].currentTop + '%';
            }
            for(i = 0; i < data.fMissles.length; i++){
                $scope.fMissles[i].style.left = data.fMissles[i].currentLeft + '%';
                $scope.fMissles[i].style.top = data.fMissles[i].currentTop + '%';
            }
            for(i = 0; i < data.enemies.length; i++){
                $scope.enemies[i].style.left = data.enemies[i].currentLeft + '%';
                $scope.enemies[i].style.top = data.enemies[i].currentTop + '%';
            }
            for(i = 0; i < data.players.length; i++){
                $scope.players[i].style.left = data.players[i].currentLeft + '%';
                $scope.players[i].style.top = data.players[i].currentTop + '%';
            }
        });

        $scope.playerMv = {};

        var field = angular.element(document.getElementsByName('planeparent'));

        $scope.createBody = function(){
            var missle = document.createElement("i");

            missle.className = 'fa fa-ellipsis-h';
            missle.style.position = 'absolute';
            missle.style.left = '-10%';
            missle.style.top = '-10%';

            field.append( missle);

            $scope.fMissles.push(missle);
        };

        $scope.createEBody = function(){
            var missle = document.createElement("i");

            missle.className = 'fa fa-ellipsis-h';
            missle.style.position = 'absolute';
            missle.style.left = '-10%';
            missle.style.top = '-10%';

            field.append( missle);

            $scope.eMissles.push(missle);
        };

        $scope.createEnemy = function(top, left){
            var enemy = document.createElement("i");

            enemy.className = 'fa fa-fighter-jet fa-rotate-180';
            enemy.style.position = 'absolute';
            enemy.style.left = '-10%';
            enemy.style.top = '-10%';

            field.append( enemy);

            $scope.enemies.push(enemy);
        };

        $scope.createPlayer = function(){
            var player = document.createElement("i");

            player.className = 'fa fa-plane fa-rotate-45';
            player.style.position = 'absolute';
            player.style.left = '-10%';
            player.style.top = '-10%';

            field.append( player);

            $scope.players.push(player);
        };

        document.onkeydown = function(e){
            var evt = e || window.event;

            if(evt.keyCode === 40){
                $scope.playerMv.mvD = true;
                $scope.socket.emit('control-movement', $scope.playerMv);
            }
            if(evt.keyCode === 38){
                $scope.playerMv.mvU = true;
                $scope.socket.emit('control-movement', $scope.playerMv);
            }
            if(evt.keyCode == 37){
                $scope.playerMv.mvR = true;
                $scope.socket.emit('control-movement', $scope.playerMv);
            }
            if(evt.keyCode == 39){
                $scope.playerMv.mvL = true;
                $scope.socket.emit('control-movement', $scope.playerMv);
            }
        };

        document.onkeyup = function(e){
            var evt = e || window.event;

            if(evt.keyCode === 40){
                $scope.playerMv.mvD = false;
                $scope.socket.emit('control-movement', $scope.playerMv);
            }
            if(evt.keyCode === 38){
                $scope.playerMv.mvU = false;
                $scope.socket.emit('control-movement', $scope.playerMv);
            }
            if(evt.keyCode == 37){
                $scope.playerMv.mvR = false;
                $scope.socket.emit('control-movement', $scope.playerMv);
            }
            if(evt.keyCode == 39){
                $scope.playerMv.mvL = false;
                $scope.socket.emit('control-movement', $scope.playerMv);
            }

            if(evt.keyCode == 32){
                $scope.socket.emit('control-shoot', {});
            }
        };
    }
]);
