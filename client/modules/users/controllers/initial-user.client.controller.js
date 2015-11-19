'use strict';

// User configs controller
angular.module('users').controller('InitialUserController', ['$rootScope', '$scope', '$http', '$stateParams', '$location', '$timeout', 'Authentication', 'InitialUser', 'Alerts',
    function ($rootScope, $scope, $http, $stateParams, $location, $timeout, Authentication, InitialUser, Alerts) {
        $scope.allowAdminCreate = false;
        $scope.authentication = Authentication;
        $scope.credentials = {roles: ['admin']};

//Initializes the createAlerts array
        $scope.Alerts = Alerts;

        function resetCreateForm() {
            $scope.credentials.firstName = '';
            $scope.credentials.lastName = '';
            $scope.credentials.username = '';
            $scope.credentials.password = '';
        }

        $scope.cancel = function () {
            $location.path('/');
        };


        $scope.createUser = function () {

            $scope.credentials.username = $scope.credentials.username.toLowerCase();
            $http.post('api/' + window.apiVer + '/auth/signup', $scope.credentials).success(function (response) {
                // If successful we assign the response to the global user model
                $scope.Alerts.addAlert('success', 'User Added Successfully');
                $location.path('/');

            }).error(function (response) {
                $scope.Alerts.addAlert('danger', response.data.message, 2000);
            });
        };


        $scope.adminCheck = function () {
            InitialUser.get({},
                //success
                function (response) {
                    if (response.adminExists) {
                        $scope.allowAdminCreate = false;
                        $location.path('/');
                    }
                    else {
                        $scope.allowAdminCreate = true;
                    }

                },
                //error
                function (response) {
                    $scope.allowAdminCreate = false;
                    $scope.Alerts.addAlert('danger', response.data.message, 2000);
                    $location.path('/');
                }
            );

        };

        $rootScope.back = [];
        $rootScope.links = [];

    }
]);


