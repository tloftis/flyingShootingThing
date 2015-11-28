'use strict';

/* globals async: true */
/* globals moment: true */

// Reports controller
angular.module('chat').controller('chatController', ['socketService', '$scope', '$state', 'Alerts', '$location',
    function (socketService, $scope, $state, Alerts, $location) {
        console.log('Chat Controller');
        $scope.comments = [];

        var commentField = angular.element(document.getElementsByName('comments'));
        var maxComments = 50;

        $scope.socket = socketService;

        window.chat = function(data){
            $scope.socket.emit('chat', data);
        };

        window.chatSetName = function(data){
            $scope.socket.emit('chat-setname', data);
        };

        $scope.socket.on('chat-get', function(data) {
            console.log(data.username + ' : ' + data.message);
            $scope.addComment(data.username, data.message);
        });

        $scope.addComment = function(username, message){
            if($scope.comments.length >= maxComments){
                $scope.comments[0].parentNode.removeChild($scope.comments[0]);
                $scope.comments.shift();
            }

            var comment = document.createElement("pre");
            comment.innerHTML = '<strong>' + username + '</strong>' + ' : ' + message;
            commentField.append(comment);

            $scope.comments.push(comment);
        };
    }
]);
