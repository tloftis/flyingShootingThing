'use strict';

/* globals async: true */
/* globals moment: true */
angular.module('core').factory('socketService', ['$location',
    function ($location) {
        var hostUrl = $location.$$protocol + '://' + $location.$$host + ':' + $location.$$port;
        return io(hostUrl,{ 'forceNew':true });
    }
]);