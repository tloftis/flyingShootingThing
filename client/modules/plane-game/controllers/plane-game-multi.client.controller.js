'use strict';

/* globals async: true */
/* globals moment: true */

// Reports controller
angular.module('plane-game').controller('planeGameMultiController', ['$scope', '$state', 'Alerts', '$location',
    function ($scope, $state, Alerts, $location) {
        console.log('Multi player');

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

        console.log('single player');

        $scope.eMissles = [];
        $scope.fMissles = [];
        $scope.enemies = [];
        $scope.player = {};

        var moveLeft, moveRight, moveUp, moveDown;
        var field = angular.element(document.getElementsByName('planeparent'));

        $scope.left = function(){
            if($scope.player.currentLeft < 100)
                $scope.player.currentLeft += 0.5;
        };

        $scope.right = function(){
            if($scope.player.currentLeft > 0)
                $scope.player.currentLeft -= 0.5;
        };

        $scope.up = function(){
            $scope.player.currentTop -= 7;
            if($scope.player.currentTop < 0)
                $scope.player.currentTop = 0;
        };

        $scope.down = function(){
            $scope.player.currentTop += 7;
            if($scope.player.currentTop > 100)
                $scope.player.currentTop = 100;
        };

        $scope.createBody = function(){
            var missle = {
                currentLeft: $scope.player.currentLeft,
                currentTop: $scope.player.currentTop,
                element: document.createElement("i")
            };

            missle.element.className = 'fa fa-ellipsis-h';
            missle.element.style.position = 'absolute';
            missle.element.style.left = missle.currentLeft + '%';
            missle.element.style.top = missle.currentTop + '%';

            angular.element(document.getElementsByName('planeparent')).append( missle.element);

            $scope.fMissles.push(missle);
        };

        $scope.createEBody = function(enemy){
            var missle = {
                currentLeft: enemy.currentLeft,
                currentTop: enemy.currentTop,
                element: document.createElement("i")
            };

            missle.element.className = 'fa fa-ellipsis-h';
            missle.element.style.position = 'absolute';
            missle.element.style.left = missle.currentLeft + '%';
            missle.element.style.top = missle.currentTop + '%';

            field.append( missle.element);

            $scope.eMissles.push(missle);
        };

        $scope.createEnemy = function(){
            var enemy = {
                currentLeft: 100,
                currentTop: getRandomArbitrary(0, 100),
                topDiffer: 1,
                dead: false,
                element: document.createElement("i")
            };

            enemy.element.className = 'fa fa-fighter-jet fa-rotate-180';
            enemy.element.style.position = 'absolute';
            enemy.element.style.left = enemy.currentLeft + '%';
            enemy.element.style.top = enemy.currentTop + '%';

            field.append( enemy.element);

            $scope.enemies.push(enemy);
        };

        $scope.createPlayer = function(){
            var player = {
                currentLeft: 10,
                currentTop: 50,
                topDiffer: 1,
                element: document.createElement("i")
            };

            player.element.className = 'fa fa-plane fa-rotate-45';
            player.element.style.position = 'absolute';
            player.element.style.left = player.currentLeft + '%';
            player.element.style.top = player.currentTop + '%';

            field.append( player.element);

            $scope.player = player;
        };

        $scope.restart = function(){
            clearInterval(enemySpawnInterval);

            while($scope.enemies.length){
                $scope.enemies[0].element.parentNode.removeChild($scope.enemies[0].element);
                $scope.enemies.splice(0, 1);
            }
            while($scope.fMissles.length){
                $scope.fMissles[0].element.parentNode.removeChild($scope.fMissles[0].element);
                $scope.fMissles.splice(0, 1);
            }
            while($scope.eMissles.length){
                $scope.eMissles[0].element.parentNode.removeChild($scope.eMissles[0].element);
                $scope.eMissles.splice(0, 1);
            }

            $scope.player.currentTop = 50;
            $scope.player.currentLeft = 10;

            $scope.$apply();
        };

        function getRandomArbitrary(min, max) {
            return Math.floor(Math.random() * (max - min) + min);
        }

        var planeInterval = setInterval(function(){
            if(moveDown){
                $scope.down();
            }
            if(moveUp){
                $scope.up();
            }
            if(moveLeft){
                $scope.left();
            }
            if(moveRight){
                $scope.right();
            }

            $scope.player.element.style.left = $scope.player.currentLeft + '%';
            $scope.player.element.style.top = $scope.player.currentTop + '%';

            $scope.$apply();
        }, 50);

        var bulletInterval = setInterval(function(){
            var miss = {};
            for(var i =0; i< $scope.fMissles.length; i++){
                miss =  $scope.fMissles[i];
                miss.currentLeft += 2;

                if(miss.currentLeft > 100){
                    miss.element.parentNode.removeChild(miss.element);
                    $scope.fMissles.splice(i, 1);
                }else{
                    var window = 2,
                        enemy = {};

                    for(var j =0; j< $scope.enemies.length; j++){
                        enemy = $scope.enemies[j];

                        if(( (enemy.currentLeft + window) > miss.currentLeft) && (enemy.currentLeft - window) < miss.currentLeft){
                            if(( (enemy.currentTop + window) > miss.currentTop) && (enemy.currentTop - window) < miss.currentTop){
                                enemy.dead = true;
                                console.log('hit');
                            }
                        }
                    }

                    miss.element.style.left = miss.currentLeft + '%';
                }
            }

            $scope.$apply();
        }, 50);

        var eBulletInterval = setInterval(function(){
            var miss = {};
            for(var i =0; i< $scope.eMissles.length; i++){
                miss =  $scope.eMissles[i];
                miss.currentLeft -= 2;

                if(miss.currentLeft < 0){
                    miss.element.parentNode.removeChild(miss.element);
                    $scope.eMissles.splice(i, 1);
                }else{
                    var window = 2,
                        enemy = {};

                    if(( ($scope.player.currentLeft + window) > miss.currentLeft) && ($scope.player.currentLeft - window) < miss.currentLeft){
                        if(( ($scope.player.currentTop + window) > miss.currentTop) && ($scope.player.currentTop - window) < miss.currentTop){
                            Alerts.addAlert('success', 'You\'ve been hit!');
                            $scope.restart();
                        }
                    }

                    miss.element.style.left = miss.currentLeft + '%';
                }
            }

            $scope.$apply();
        }, 50);


        var enemyInterval = setInterval(function(){
            var enem = {};
            var ran = 0;

            for(var i =0; i< $scope.enemies.length; i++){
                enem =  $scope.enemies[i];
                enem.currentLeft -= 1;

                ran = getRandomArbitrary(0, 10);

                if(ran === 3){
                    enem.topDiffer -= getRandomArbitrary(1, 3);
                    console.log('Adjust down');
                }

                if(ran === 2){
                    enem.topDiffer += getRandomArbitrary(1, 3);
                    console.log('Adjust up');
                }

                if(ran > 7){
                    $scope.createEBody(enem);
                    console.log('Shooting!');
                }

                enem.currentTop += enem.topDiffer;

                if(enem.currentTop < 0){
                    enem.currentTop = 0;
                }
                if(enem.currentTop > 100){
                    enem.currentTop = 100;
                }

                if((enem.currentLeft < 0) || enem.dead){
                    enem.element.parentNode.removeChild(enem.element);
                    $scope.enemies.splice(i, 1);
                }else{
                    enem.element.style.left = enem.currentLeft + '%';
                    enem.element.style.top = enem.currentTop + '%';
                }
            }

            $scope.$apply();
        }, 100);

        var enemySpawnInterval;

        document.onkeydown = function(e){
            var evt = e || window.event;

            if(evt.keyCode === 40){
                moveDown = true;
            }
            if(evt.keyCode === 38){
                moveUp = true;
            }
            if(evt.keyCode == 37){
                moveRight = true;
            }
            if(evt.keyCode == 39){
                moveLeft = true;
            }
        };

        document.onkeyup = function(e){
            var evt = e || window.event;

            if(evt.keyCode === 40){
                moveDown = false;
            }
            if(evt.keyCode === 38){
                moveUp = false;
            }
            if(evt.keyCode == 37){
                moveRight = false;
            }
            if(evt.keyCode == 39){
                moveLeft = false;
            }
            if(evt.keyCode == 32){
                $scope.createBody();
            }
            if(evt.keyCode == 13){
                enemySpawnInterval = setInterval(function(){
                    if(($scope.enemies.length <= 10) && (getRandomArbitrary(0, 10) > 8))
                        $scope.createEnemy();
                }, 100);
            }
        };
    }
]);
