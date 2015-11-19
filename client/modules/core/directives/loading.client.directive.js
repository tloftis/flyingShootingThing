'use strict';

angular.module('core').directive('waiting', function () {
    return {
        restrict: 'E',
        replace: true,
        template: '<div class="loading"><img src="/client/core/img/loaders/ajax-loader.gif" width="20" height="20" /></div>',
        link: function (scope, element, attr) {
            scope.$watch(attr.loading, function (val) {
                if (val)
                    $(element).show();
                else
                    $(element).hide();
            });
        }
    };
});