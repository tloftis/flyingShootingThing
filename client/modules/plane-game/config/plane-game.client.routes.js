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
                            $scope.subHead = 'Press Enter to Start, Arrows to move, space to shoot';
                        }
                    }
                }
            })
    }
]);
