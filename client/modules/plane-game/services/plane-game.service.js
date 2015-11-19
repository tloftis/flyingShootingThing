'use strict';

angular.module('plane-game').factory('planeGameService', ['Utility',
    function (Utility) {

        var service = {};

        service.getPlanesConfig = function (params) {
            return Utility.get('plane-game', query);
        };

        return service;
    }
]);