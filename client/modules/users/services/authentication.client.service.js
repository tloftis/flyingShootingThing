'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', [

    function () {
        var scope = this;

        scope._data = {
            user: window.user
        };

        scope._data.isAdmin = function () {
            for (var i in _this._data.user.roles) {
                if (scope._data.user.roles[i] === 'admin') {
                    return true;
                }
            }

            return false;
        };

        return scope._data;
    }
]);
