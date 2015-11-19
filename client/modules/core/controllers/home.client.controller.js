'use strict';


angular.module('core').controller('HomeController', ['$rootScope', '$scope', '$state', 'Authentication',
    function ($rootScope, $scope, $state, Authentication) {
        $scope.authentication = Authentication;

        if ($state.is('config'))
        {
            $rootScope.back = undefined;
            $rootScope.links = [];

            if (+window.includedFeatures.configUsers) {
                $rootScope.links.push({
                    sref: 'listUserConfig',
                    faIcon: 'fa-users',
                    text: 'Users'
                });
            }

            if (+window.includedFeatures.IoTDevices) {
                $rootScope.links.push({
                    sref: 'agent.list',
                    faIcon: 'fa-list',
                    text: 'IoT Agents'
                },{
                    sref: 'opcua-client.list',
                    faIcon: 'fa-sitemap',
                    text: 'OPC-UA Endpoints'
                },{
                    sref: 'mqtt-client.list',
                    faIcon: 'fa-feed',
                    text: 'MQTT Connections'
                });
            }
        }
        else {
            $rootScope.back = undefined;
            $rootScope.links = [];
        }
    }
]);
