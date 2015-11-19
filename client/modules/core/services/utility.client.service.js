'use strict';

angular.module('core').factory('Utility', ['$q', '$http', 'MessageParserService', 'Alerts',
    function ($q, $http, MessageParserService, Alerts) {
        var service = {
                get: {},
                post: {},
                delete: {},
                put: {}
            },
            parseErrorMessage = function (error) {
                return {message: MessageParserService.parseMessage(error)};
            };

        service.get = function (rt, params) {

            var deferred = $q.defer(),
                query = {};

            query.params = params || {};

            $http.get('/api/' + rt, query)
                .success(function (data) {
                    Alerts.addAlert('debug', 'GET ' + rt + ': success');
                    deferred.resolve(data);
                })
                .error(function (data, status) {
                    var errMsg = 'POST ' + rt + ': Failed. Status=' + status + '  - Msg=\'' + parseErrorMessage(data).message + '\'';
                    Alerts.addAlert('danger', errMsg, data);
                    deferred.reject();
                });

            return deferred.promise;
        };

        service.post = function (rt, payload) {
            var deferred = $q.defer();
            $http.post('/api/' + rt, payload)
                .success(function (data) {
                    Alerts.addAlert('debug', 'POST ' + rt + ': success');

                    deferred.resolve(data);
                })
                .error(function (data, status) {

                    var errMsg = 'POST ' + rt + ': Failed. Status=' + status + '  - Msg=\'' + parseErrorMessage(data).message + '\'';
                    Alerts.addAlert('danger', errMsg, data);
                    deferred.reject();
                });
            return deferred.promise;
        };

        service.put = function (rt, payload) {
            var deferred = $q.defer();
            $http.put('/api/' + rt, payload)
                .success(function (data) {
                    Alerts.addAlert('debug', 'PUT ' + rt + ': success');

                    deferred.resolve(data);
                })
                .error(function (data, status) {

                    var errMsg = 'PUT ' + rt + ': Failed. Status=' + status + '  - Msg=\'' + parseErrorMessage(data).message + '\'';
                    Alerts.addAlert('danger', errMsg, data);
                    deferred.reject();
                });
            return deferred.promise;
        };

        service.delete = function (rt, payload) {
            var deferred = $q.defer();
            $http.delete('/api/' + rt, payload)
                .success(function (data) {
                    Alerts.addAlert('debug', 'DELETE ' + rt + ': success');

                    deferred.resolve(data);
                })
                .error(function (data, status) {

                    var errMsg = 'DELETE ' + rt + ': Failed. Status=' + status + '  - Msg=\'' + parseErrorMessage(data).message + '\'';
                    Alerts.addAlert('danger', errMsg, data);
                    deferred.reject();
                });
            return deferred.promise;
        };

        return service;
    }]
);
