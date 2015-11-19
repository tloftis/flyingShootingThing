'use strict';

// Configuring the Articles module
angular.module('core').run(['Menus',
    function (Menus) {
    }
]).run(['$rootScope', '$state', 'Alerts', function ($rootScope, $state, Alerts) {
    $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
        event.preventDefault();
        Alerts.addAlert('danger', error.message);
    });
}]).run(['$rootScope', function($rootScope) {
    //Ensures that the table width matches the table when a row is dragged
    var sortableTableHelper =  function(e, ui) {
        ui.children().each(function() {
            $(this).width($(this).width());
        });
        return ui;
    };
}]);
