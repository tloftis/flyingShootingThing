'use strict';

/* globals async: true */
/* globals moment: true */

// Reports controller
angular.module('freak').controller('freakController', ['socketService', '$scope', 'freakService', 'Alerts', '$location',
    function (socketService, $scope, freakService, Alerts, $location) {
        console.log('Freak Controller');
        $scope.podcasts = [];

        $scope.update = function(){

            freakService.update(function(data){
                console.log(data);
                Alerts.addAlert('success', 'New Podcasts downloaded!');
            });
        };

        $scope.init = function(){
            freakService.list(function(data){
                console.log(data);
                $scope.podcasts = data;
            });
        };
    }
]);
