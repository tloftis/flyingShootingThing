'use strict';

//Setting up route
angular.module('hangman').config(['$stateProvider',
    function ($stateProvider) {
        // Reports state routing
        $stateProvider.state('hangman', {
            url: '/hangman',
            templateUrl: 'modules/hangman/views/hangman.client.view.html',
            abstract: true,
            controller: 'hangmanController'
        }).
        state('hangman.single', {
            url: '/single',
            views: {
                'hangman@plane-game': {
                    templateUrl: 'modules/hangman/views/hangman-single.client.view.html',
                    controller: 'hangmanSingleController'
                },
                'header@plane-game': {
                    controller: function($scope) {
                        $scope.head = 'Hangman Single Player';
                        $scope.subHead = '';
                    }
                }
            }
        })
    }
]);
