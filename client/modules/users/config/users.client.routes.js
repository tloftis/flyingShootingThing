'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
    function ($stateProvider) {
        // Users state routing
        $stateProvider.
            state('signin', {
                url: '/signin',
                views: {
                    '@': {
                        controller: 'AuthenticationController',
                        templateUrl: 'modules/users/views/authentication/signin.client.view.html'
                    }
                }
            }).
            state('user', {
                url: '/profile',
                views: {
                    '@': {
                        controller: 'SettingsController',
                        templateUrl: 'modules/users/views/settings/view-profile.client.view.html'
                    }
                }
            }).
            state('password', {
                url: '/settings/password',
                views: {
                    '@': {
                        controller: 'SettingsController',
                        templateUrl: 'modules/users/views/settings/change-password.client.view.html'
                    }
                }
            }).
            //state('profile', {
            //    url: '/settings/profile',
            //    templateUrl: 'modules/users/views/settings/edit-profile.client.view.html'
            //
            //}).
            //state('signup', {
            //    url: '/signup',
            //    templateUrl: 'modules/users/views/authentication/signup.client.view.html'
            //}).
            //state('forgot', {
            //    url: '/password/forgot',
            //    templateUrl: 'modules/users/views/password/forgot-password.client.view.html'
            //}).
            //state('reset-invalid', {
            //    url: '/password/reset/invalid',
            //    templateUrl: 'modules/users/views/password/reset-password-invalid.client.view.html'
            //}).
            //state('reset-success', {
            //    url: '/password/reset/success',
            //    templateUrl: 'modules/users/views/password/reset-password-success.client.view.html'
            //}).
            //state('reset', {
            //    url: '/password/reset/:token',
            //    templateUrl: 'modules/users/views/password/reset-password.client.view.html'
            //}).
            state('createUserConfig', {
            url: '/users/create',
            views: {
                '@': {
                    controller: 'UsersController',
                    templateUrl: 'modules/users/views/config/create-user-config.client.view.html'
                }
            }
        }).
            state('listUserConfig', {
                url: '/users',
                views: {
                    '@': {
                        controller: 'UsersController',
                        templateUrl: 'modules/users/views/config/list-user-configs.client.view.html'
                    }
                }
            }).
            state('editUserConfig', {
                url: '/users/:userId/edit',
                views: {
                    '@': {
                        controller: 'UsersController',
                        templateUrl: 'modules/users/views/config/edit-user-config.client.view.html'
                    }
                }

            }).
            state('initialUserConfig', {
                url: '/initialUser',
                controller: 'InitialUserController',
                templateUrl: 'modules/users/views/config/initial-user-config.client.view.html'
            });
    }
]);
