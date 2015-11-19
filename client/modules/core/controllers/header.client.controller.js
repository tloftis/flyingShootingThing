'use strict';

angular.module('core').controller('HeaderController', ['$rootScope', '$scope', '$location', 'Authentication', 'Menus',
    function($rootScope, $scope, $location, Authentication, Menus) {

        $scope.authentication = Authentication;
        $scope.includedFeatures = window.includedFeatures;

        $scope.isCollapsed = false;
        $scope.menu = Menus.getMenu('topbar');

        $scope.toggleCollapsibleMenu = function() {
            $scope.isCollapsed = !$scope.isCollapsed;
        };

        // Collapsing the menu after navigation
        $scope.$on('$stateChangeSuccess', function() {
            $scope.isCollapsed = false;
        });

        $scope.rightOptions = {
            visible: false
        };

        $scope.title = window.title;
        $scope.version = window.version;

        $scope.showSideBar = true;
        $scope.toggleSidebar = function () {
            $scope.showSideBar = !$scope.showSideBar;
        };

    }

]);
