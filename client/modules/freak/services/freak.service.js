'use strict';

angular.module('freak').factory('freakService', ['Utility',
    function (Utility) {

        var service = {};

        service.update = function (params) {
            return Utility.get('freak/update');
        };

        service.list = function (params) {
            return Utility.get('freak/list');
        };

        return service;
    }
]);