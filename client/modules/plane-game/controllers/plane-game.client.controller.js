'use strict';

// Reports controller
angular.module('plane-game').controller('planeGameController', ['$rootScope', '$scope', 'Alerts', '$location',
    function ($rootScope, $scope, Alerts, $location) {

        var hostUrl = $location.$$protocol + '://' + $location.$$host + ':' + $location.$$port;
        $rootScope.socket = io(hostUrl,{ 'forceNew':true });

        //Disconnect when the view is clicked off of
        $rootScope.$on('$destroy', function() {
            $rootScope.socket.io.disconnect();
        });
    }]);
