'use strict';

//Setting up route
angular.module('freak').config(['$stateProvider',
    function ($stateProvider) {
        // Reports state routing
        $stateProvider.state('freak', {
            url: '/freak',
            templateUrl: 'modules/freak/views/freak.client.view.html',
            abstract: true,
            controller: 'freakController'
        }).
        state('freak.podcasts', {
            url: '/podcasts',
            views: {
                'freak-canvas@freak': {
                    templateUrl: 'modules/freak/views/freak-podcasts.client.view.html',
                    controller: 'freakPodcastsController'
                },
                'chat-canvas@freak': {
                    templateUrl: 'modules/chat/views/chat.client.view.html',
                    controller: 'chatController'
                },
                'header@freak': {
                    controller: function($scope) {
                        $scope.head = 'Dave & Chuck Podcast Grabber';
                        $scope.subHead = 'This grabs the latest 2 podcasts downloads them to the server, adds meta data and adds a dowload link to this page, work blocked it so now it is here';
                    }
                }
            }
        })
    }
]);
