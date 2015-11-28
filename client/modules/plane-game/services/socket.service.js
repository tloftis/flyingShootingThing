'use strict';

/* globals async: true */
/* globals moment: true */
angular.module('plane-game').factory('socketService', ['Utility', '$location',
    function (Utility, $location) {
        var hostUrl = $location.$$protocol + '://' + $location.$$host + ':' + $location.$$port;
        console.log(hostUrl);
        var service = {};

        return io(hostUrl,{ 'forceNew':true });
    }
]);