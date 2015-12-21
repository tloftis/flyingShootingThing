'use strict';

/* globals async: true */
/* globals moment: true */

// Reports controller
angular.module('plane-game').controller('planeGameMultiController', ['socketService', '$scope', '$state', 'Alerts', '$location',
    function (socketService, $scope, $state, Alerts, $location) {
        $scope.players = [];
        $scope.enemies = [];
        $scope.fMissles = [];
        $scope.eMissles = [];
        $scope.upgrads = [];
        $scope.average = 0;
        $scope.socket = socketService;
        $scope.playerData = {score: 0};
        $scope.highScore = 0;

        var speech = window.speechSynthesis;
        var pew = new SpeechSynthesisUtterance('PEW!');

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
            fieldEle = document.getElementsByName('planeparent'),
            field = angular.element(fieldEle),
            clickSpace = angular.element(document.getElementsByName('plane-game'));

        $scope.playerMv = {};

        function updateElements(data) {
            diff = (new Date()).getMilliseconds() - start;

            if(diff > 0)
                averages.push(diff);

            start = (new Date()).getMilliseconds();

            if(averages.length > 500) averages.shift();

            //remove dead players, enemies, bullets
            while(data.eMissles.length < $scope.eMissles.length)
                removeEMissles($scope.eMissles[0], 0);

            while(data.fMissles.length < $scope.fMissles.length){
                removeFMissle($scope.fMissles[0], 0);
            }

            while(data.enemies.length < $scope.enemies.length)
                removeEnemy($scope.enemies[0], 0);

            while(data.players.length < $scope.players.length)
                removePlayer($scope.players[0], 0);

            while(data.upgrads.length < $scope.upgrads.length)
                removeUpgrade($scope.upgrads[0], 0);

            //add new enemies, bullets, players
            while(data.players.length > $scope.players.length)
                $scope.players.push(createPlayer());

            while(data.enemies.length > $scope.enemies.length)
                $scope.enemies.push(createEnemy());

            while(data.fMissles.length > $scope.fMissles.length){
                $scope.fMissles.push(createBody());
                speech.speak(pew)
            }

            while(data.eMissles.length > $scope.eMissles.length)
                $scope.eMissles.push(createEBody());

            while(data.upgrads.length > $scope.upgrads.length)
                $scope.upgrads.push(createUpgrade());

            //update movements
            var i = 0;
            for(i = 0; i < data.eMissles.length; i++)
                updateElm($scope.eMissles[i], data.eMissles[i]);

            for(i = 0; i < data.fMissles.length; i++) {
                updateElm($scope.fMissles[i], data.fMissles[i]);
            }

            for(i = 0; i < data.enemies.length; i++)
                updateElm($scope.enemies[i], data.enemies[i]);

            for(i = 0; i < data.upgrads.length; i++)
                updateElm($scope.upgrads[i], data.upgrads[i]);

            for(i = 0; i < data.players.length; i++)
                updateElm($scope.players[i], data.players[i]);

            if($scope.player)
                updateElm($scope.player, data.player);

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

            $scope.playerMv.hoz = 0;
            $scope.playerMv.vert = 0;

            stopJoystick();
            Alerts.addAlert('danger', 'You Dead');
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

        //Element removal functions
        function removeUpgrade(upgrade, index){
            if(upgrade.parentNode){
                upgrade.parentNode.removeChild(upgrade);
                $scope.upgrads.splice(index, 1);
            }
        }

        //Element Position movement functions
        function updateElm(element, data){
            if(element.style){
                element.style.left = data.currentLeft + '%';
                element.style.top = data.currentTop + '%';

                if(data.template)
                    element.className = data.template;
            }
        }

        //Element creation functions
        var createBody = function(){
            var missle = document.createElement("i");

            missle.className = 'fa fa-ellipsis-h text-warning';
            missle.style.position = 'absolute';
            missle.style.left = '-10%';
            missle.style.top = '-10%';

            field.append( missle);

            return missle;
        };

        var createEBody = function(){
            var missle = document.createElement("i");

            missle.className = '';
            missle.style.position = 'absolute';
            missle.style.left = '-10%';
            missle.style.top = '-10%';

            field.append( missle);

            return missle;
        };

        var createEnemy = function(){
            var enemy = document.createElement("i");

            enemy.className = '';
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

        var createUpgrade = function(){
            var upgrade = document.createElement("i");

            upgrade.className = '';
            upgrade.style.position = 'absolute';
            upgrade.style.left = '-10%';
            upgrade.style.top = '-10%';

            field.append(upgrade);

            return upgrade;
        };

        //Control handling
        document.onclick = function() {
            $scope.socket.emit('control-shoot', {});
        };

        document.onkeydown = function(e){
            var evt = e || window.event;

            if(!evt.repeat){
                if(evt.keyCode === 40 || evt.keyCode === 83){
                    $scope.playerMv.vert = 1;
                }
                if(evt.keyCode === 38 || evt.keyCode === 87){
                    $scope.playerMv.vert = -1;
                }
                if(evt.keyCode === 37 || evt.keyCode === 65){
                    $scope.playerMv.hoz = -1;
                }
                if(evt.keyCode === 39 || evt.keyCode === 68){
                    $scope.playerMv.hoz = 1;
                }

                $scope.socket.emit('control-movement', $scope.playerMv);

                if(evt.keyCode === 69){
                    $scope.socket.emit('control-shoot', {});
                }
            }
        };

        document.onkeyup = function(e){
            var evt = e || window.event;

            if(!evt.repeat) {
                if(evt.keyCode === 40 || evt.keyCode === 83){
                    if($scope.playerMv.vert === 1) $scope.playerMv.vert = 0;
                }
                if(evt.keyCode === 38 || evt.keyCode === 87){
                    if($scope.playerMv.vert === -1) $scope.playerMv.vert = 0;
                }
                if(evt.keyCode === 37 || evt.keyCode === 65){
                    if($scope.playerMv.hoz === -1) $scope.playerMv.hoz = 0;
                }
                if(evt.keyCode === 39 || evt.keyCode === 68){
                    if($scope.playerMv.hoz === 1) $scope.playerMv.hoz = 0;
                }

                $scope.socket.emit('control-movement', $scope.playerMv);
            }
        };

        var interval;

        $scope.join = function(){
            //if($scope.mobilecheck()) startJoystick();
            //window.scroll(0,findPos(fieldEle[0]));
            $scope.socket.emit('join-multiplier', {});
        };

        /*

         $scope.mobilecheck = function() {
             var check = false;
             (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
             return check;
             };

             //Mobile joystick support
             if($scope.mobilecheck()){
             field.on('mousedown', function mouseState(e) {
             if(!interval)
             interval = setInterval(onHold, 0)
             });

             field.on('mouseup', function mouseState(e) {
             clearInterval(interval);
             interval = undefined;

             $scope.playerMv.hoz = 0;
             $scope.playerMv.vert = 0;
             $scope.socket.emit('control-movement', $scope.playerMv);
             });
         }

         var joystick;

         function stopJoystick() {
             joystick.destroy();
             joystick = null;
         }

         function startJoystick(){
             joystick = new VirtualJoystick({
                 mouseSupport	: true,
                 limitStickTravel: true,
                 stickRadius	: 50
             });

             $scope.playerMv.hoz = joystick.deltaX()/50;
             $scope.playerMv.vert = joystick.deltaY()/50;
             $scope.socket.emit('control-movement', $scope.playerMv);
         }

        function findPos(obj) {
            var curtop = 0;
            if (obj.offsetParent) {
                do {
                    curtop += obj.offsetTop;
                } while (obj = obj.offsetParent);
                return [curtop];
            }
        }

        function onHold(){
            $scope.playerMv.hoz = joystick.deltaX()/50;
            $scope.playerMv.vert = joystick.deltaY()/50;
            $scope.socket.emit('control-movement', $scope.playerMv);
        }
        */
    }
]);
