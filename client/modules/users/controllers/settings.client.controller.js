'use strict';

angular.module('users').controller('SettingsController', ['$rootScope', '$scope', '$http', '$location', 'Users', 'Authentication',
    function ($rootScope, $scope, $http, $location, Users, Authentication) {
        $scope.user = Authentication.user;



        // If user is not signed in then redirect back home
        if (!$scope.user) $location.path('/');

        // Update a user profile
        $scope.updateUserProfile = function (isValid) {
            if (isValid) {
                $scope.success = $scope.error = null;
                var user = new Users($scope.user);

                user.$update(function (response) {
                    $scope.success = true;
                    Authentication.user = response;
                }, function (response) {
                    $scope.error = response.data.message;
                });
            } else {
                $scope.submitted = true;
            }
        };

        // Change user password
        $scope.changeUserPassword = function () {
            $scope.success = $scope.error = null;

            $http.post('api/' + window.apiVer + '/users/password', $scope.passwordDetails).success(function (response) {
                // If successful show success message and clear form
                $scope.success = true;
                $scope.passwordDetails = null;
            }).error(function (response) {
                $scope.error = response.message;
            });
        };


        $rootScope.back = [];
        $rootScope.links = [
            {
                sref: 'user',
                text: ' User Profile',
                faIcon: 'fa-user'
            },
            {
                sref: 'password',
                text: ' Change Password',
                faIcon: 'fa-key'
            },
            {
                href: '/auth/signout',
                text: ' Sign Out',
                faIcon: 'fa-sign-out'
            }
        ];
    }
]);
