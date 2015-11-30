'use strict';

//Setting up route
angular.module('freak').config(['$stateProvider',
    function ($stateProvider) {
        // Reports state routing
        $stateProvider.state('freak', {
                url: '/freak',
                templateUrl: 'modules/freak/views/freak.client.view.html',
                controller: 'freakController'
            })
    }
]);
