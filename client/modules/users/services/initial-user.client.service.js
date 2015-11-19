'use strict';

//User configs service used to communicate User configs REST endpoints
angular.module('users').factory('InitialUser', ['$resource',
    function ($resource) {
        return $resource('api/initialUser', {}, {
            update: {
                method: 'PUT'
            }

        });
    }
]);

