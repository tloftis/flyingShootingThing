'use strict';

/* globals async: true */
/* globals moment: true */

// Reports controller
angular.module('freak').controller('freakPodcastsController', ['socketService', '$scope', 'freakService', 'Alerts', '$location',
    function (socketService, $scope, freakService, Alerts, $location) {
        $scope.podcasts = [];

        $scope.update = function(){

            freakService.update().then(function(data){
                Alerts.addAlert('success', data);
            });
        };

        $scope.init = function(){
            freakService.list().then(function(data){
                $scope.podcasts = data;
            });
        };
    }
]);
