'use strict';

/* globals async: true */
/* globals moment: true */

// Reports controller
angular.module('freak').controller('freakController', ['socketService', '$scope', 'freakService', 'Alerts', '$location',
    function (socketService, $scope, freakService, Alerts, $location) {
        console.log('Freak Controller');
    }
]);
