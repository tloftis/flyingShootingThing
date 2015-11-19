'use strict';

angular.module('users').controller('AuthenticationController', ['$rootScope', '$scope', '$http', '$location', 'Authentication',
    function ($rootScope, $scope, $http, $location, Authentication) {
        $scope.authentication = Authentication;

        // If user is signed in then redirect back home
        if ($scope.authentication.user) $location.path('/');

        $scope.roles = [{name: 'Admin', role: 'admin'},
            {name: 'Operator', role: 'user'}
        ];

        $scope.signup = function () {
            $scope.credentials.username = $scope.credentials.username.toLowerCase();
            $http.post('api/' + window.apiVer + '/auth/signup', $scope.credentials).success(function (response) {
                // If successful we assign the response to the global user model
                $scope.authentication.user = response;

                // And redirect to the index page
                $location.path('/');
            }).error(function (response) {
                $scope.error = response.message;
            });
        };

        $scope.signin = function () {
            $scope.credentials.username = $scope.credentials.username.toLowerCase();
            $http.post('api/' + window.apiVer + '/auth/signin', $scope.credentials).success(function (response) {
                // If successful we assign the response to the global user model
                $scope.authentication.user = response;

                // And redirect to the index page
                $location.path('/');
            }).error(function (response) {
                $scope.error = response.message;
            });
        };

        $rootScope.back = [];
        $rootScope.links = [];
    }
]);
