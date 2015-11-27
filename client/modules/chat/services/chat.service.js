'use strict';

angular.module('chat').factory('chatService', ['Utility',
    function (Utility) {

        var service = {};

        service.getPastNames = function (params) {
            return Utility.get('chat/name', query);
        };

        return service;
    }
]);