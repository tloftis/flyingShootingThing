'use strict';

//Menu service used for managing  menus
angular.module('core').factory('Alerts', ['$timeout', '$log', 'Authentication','growl',

    function ($timeout, $log, Authentication,growl) {
        var Alerts = {
            alertArray: [{type: 'info', msg: 'Welcome to the FA Plane GAme'}],
            alertHistory: [],
            showHistory: false,
            addAlert: function (type, msg, meta) {

                if (_.isUndefined(meta)) {
                    meta = '';
                }

                //In case msg isn't a string, try to parse and return string
                if (!_.isString(msg))
                {
                   msg = msg.toString();
                }

                if (type !== 'debug') {

                    Alerts.alertHistory.unshift({
                        created: Date.now(),
                        type: type,
                        msg: msg
                    });

                    if (Alerts.alertHistory.length > 20) {
                        Alerts.alertHistory = Alerts.alertHistory.slice(Alerts.alertHistory.length - 20, 20);
                    }

                    Alerts.alertArray.push({
                        type: type,
                        msg: msg,
                        meta: meta
                    });

                    var alertIndex = Alerts.alertArray.length - 1;
                    //determine how to send the alert to the console log
                    switch (Alerts.alertArray[alertIndex].type) {
                        case 'danger':
                            growl.error(Alerts.alertArray[alertIndex].msg);
                            $log.error(Alerts.alertArray[alertIndex].msg, meta);
                            break;
                        case 'warning':
                            growl.warning(Alerts.alertArray[alertIndex].msg);
                            $log.warn(Alerts.alertArray[alertIndex].msg, meta);
                            break;
                        case 'success':
                            growl.success(Alerts.alertArray[alertIndex].msg);
                            $log.info(Alerts.alertArray[alertIndex].msg, meta);
                            break;
                        case 'info':
                            growl.info(Alerts.alertArray[alertIndex].msg);
                            $log.info(Alerts.alertArray[alertIndex].msg, meta);
                            break;
                        default:
                            growl.error(Alerts.alertArray[alertIndex].msg);
                            $log.log(Alerts.alertArray[alertIndex].msg, meta);
                    }
                } else {
                    return $log.debug(msg, meta);
                }
            }

        };
        return Alerts;

    }]
);
