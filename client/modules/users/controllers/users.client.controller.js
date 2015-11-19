'use strict';

// User configs controller
angular.module('users').controller('UsersController', ['$rootScope', '$scope', '$http', '$stateParams', '$state', '$location', '$timeout', 'Authentication', 'Users', 'Alerts',
    function ($rootScope, $scope, $http, $stateParams, $state, $location, $timeout, Authentication, Users, Alerts) {

        $scope.authentication = Authentication;
        $scope.Alerts = Alerts;
        $scope.credentials = {roles: []};
        if (!$scope.authentication.user) $location.path('/');
        if (!$scope.authentication.isAdmin()) $location.path('/');

        $scope.roles = [
            {name: 'Administrator', role: 'admin'},
            {name: 'Supervisor', role: 'super'},
            {name: 'Operator', role: 'user'},
            { name: 'Dashboard', role: 'dashboard' }
        ];

        $scope.cancel = function () {
            $location.path('/users');
        };

        $scope.createUser = function () {
            //console.log($scope.credentials);
            $scope.credentials.username = $scope.credentials.username.toLowerCase();
            // $scope.credentials.badge = $scope.credentials.badge.toLowerCase();
            $scope.credentials.enabled = true;
            $http.post('api/' + window.apiVer + '/auth/signup', $scope.credentials).success(function (response) {

                $scope.Alerts.addAlert('success', 'User created successfully', 2000);

                // If successful we assign the response to the global user model
                $location.path('/users');

            }).error(function (response) {
                $scope.Alerts.addAlert('danger', response.message, 2000);

            });
        };


        // Update existing User config
        $scope.updateUser =
            function () {
                //console.log($scope);
                $scope.user.username = $scope.user.username.toLowerCase();
                // $scope.credentials.badge = $scope.credentials.badge.toLowerCase();
                if ($scope.passwordResetChecked && $scope.userEditForm.$valid) {
                    $scope.user.password = $scope.passwordReset;
                    //console.log($scope.passwordReset);
                }
                //console.log($scope.userConfig);
                $scope.user.$update(
                    //success
                    function (response) {
                        $scope.Alerts.addAlert('success', 'User Edited Successfully', 1500);

                        $location.path('/users');
                    },
                    //error
                    function (response) {
                        $scope.Alerts.addAlert('danger', response.data.message, 2000);
                    });

            };


        // Remove existing Device
        $scope.remove = function (user) {

            var deleteUser = confirm('Are you sure you want to delete this user?');
            if (deleteUser === true) {
                user.$remove(function (response) {


                        for (var i in $scope.users) {
                            if ($scope.users [i]._id === user._id) {
                                $scope.users.splice(i, 1);
                            }
                        }

                        //Sockets.emit('data', {
                        //    target: 'commander',
                        //    method: 'reloadConfiguration'
                        //}, function (err) {
                        //    if (err) {
                        //        $log.error(err)
                        //    } else {
                        //        $log.info('Commander configuration reloaded');
                        //    }
                        //});
                    }, //Error Response
                    function (response) {
                        $scope.Alerts.addAlert('danger', response.data.message, 2000);
                    });
            }

        };

        // Find a list of User configs
        $scope.find = function () {
            Users.query(
                //success
                function (response) {
                    $scope.users = response;
                    //console.log($scope.users);
                },
                //error
                function (response) {
                    $scope.Alerts.addAlert('danger', response.data.message, 2000);
                });


        };


        // Find existing User config
        $scope.findOne = function () {
            Users.get({userId: $stateParams.userId},
                //success
                function (response) {
                    $scope.passwordResetChecked = false;
                    $scope.user = response;

                },
                //error
                function (response) {
                    $scope.Alerts.addAlert('danger', response.data.message, 2000);
                }
            );
        };


        $rootScope.back = [
            {
                sref: 'config',
                faIcon: 'fa-caret-square-o-left',
                text: 'Back to Configuration'
            }
        ];

        $rootScope.links = [
            {
                sref: 'createUserConfig',
                faIcon: 'fa-user-plus',
                text: 'Create New User'
            },
            {
                sref: 'listUserConfig',
                faIcon: 'fa-users',
                text: 'Users'
            }
        ];

    }
]);


