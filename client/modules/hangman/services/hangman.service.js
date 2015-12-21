'use strict';

angular.module('hangman').factory('hangmanService', ['Utility',
    function (Utility) {

        var service = {};

        service.getConfig = function (params) {
            return Utility.get('plane-game', query);
        };

        return service;
    }
]);