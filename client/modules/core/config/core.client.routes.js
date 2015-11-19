'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider', 'growlProvider',
    function ($stateProvider, $urlRouterProvider, growlProvider) {
        // Redirect to home view when route not found
        $urlRouterProvider.otherwise('/');

        // Home state routing
        $stateProvider.
            state('home', {
                url: '/',
                views: {
                    '@': {
                        templateUrl: 'modules/core/views/home.client.view.html'
                    }
                }
            }).
            state('config', {
                url: '/config',
                views: {
                    '@': {
                        templateUrl: 'modules/core/views/config.client.view.html',
                        controller: 'HomeController'
                    }
                }
            });

        //Global Setup for Growl messages
        growlProvider.globalReversedOrder(true);
        growlProvider.globalTimeToLive({success: 2000, error: 4000, warning: 4000, info: 2000});
        growlProvider.onlyUniqueMessages(false);

        //growlProvider.globalDisableCountDown(true);
        growlProvider.globalPosition('bottom-right');

    }
]);
