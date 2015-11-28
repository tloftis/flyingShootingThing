'use strict';

//Setting up route
angular.module('plane-game').config(['$stateProvider',
    function ($stateProvider) {
        // Reports state routing
        $stateProvider.state('plane-game', {
                url: '/plane-game',
                templateUrl: 'modules/plane-game/views/plane-game.client.view.html',
                controller: 'planeGameController'
            }).
            state('plane-game.single', {
                url: '/single',
                views: {
                    'plane-canvas@plane-game': {
                        templateUrl: 'modules/plane-game/views/plane-game-single.client.view.html',
                        controller: 'planeGameSingleController'
                    },
                    'header@plane-game': {
                        controller: function($scope) {
                            $scope.head = 'Plane Game Single Player';
                            $scope.subHead = 'Press Enter to Start, Arrows/WASD to move, Space/Mouse to shoot\n Your Green';
                        }
                    }
                }
            }).
        state('plane-game.multi', {
            url: '/multi',
            views: {
                'plane-canvas@plane-game': {
                    templateUrl: 'modules/plane-game/views/plane-game-multi.client.view.html',
                    controller: 'planeGameMultiController'
                },
                'header@plane-game': {
                    controller: function($scope) {
                        $scope.head = 'Plane Game Multi-Player';
                        $scope.subHead = 'Press Enter to Start, Arrows to move, space to shoot';
                    }
                },
                'chat-canvas@plane-game': {
                    templateUrl: 'modules/chat/views/chat.client.view.html',
                    controller: 'chatController'
                }
            }
        })
    }
]);
