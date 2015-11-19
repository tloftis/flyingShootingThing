'use strict';

angular.module('core').directive('faCheckbox', ['$compile', '$state', 'Authentication', 'Alerts', function ($compile, $state, Authentication, Alerts) {
    return {
        restrict: 'E', // allow as an element; the default is only an attribute
        scope: {
            'ngSize': '@',
            'ngModel': '='
        },
        replace: true,
        template: '<i ng-class="{ \'fa-check-square-o\': ngModel, \'fa-square-o\': !ngModel }"  class="fa {{ ngSize }}" ng-click="ngModel = !ngModel;"></i>'
    };
}]);
