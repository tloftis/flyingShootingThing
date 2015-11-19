'use strict';

angular.module('core').directive('alertDisplay', [
    function () {
        return {
            template: '<div data-ng-show="alerts.alertArray.length > 0" class="clearfix text-center">' +
            '<alert type="{{alerts.alertArray[0].type}}">{{alerts.alertArray[0].msg}}</alert>' +
            '</div>',
            restrict: 'E',
            scope: {alerts: '='}
        };
    }
]);