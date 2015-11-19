'use strict';

module.exports = {
	port: 443,
	db: process.env.MONGO_URL || 'mongodb://localhost/plane-game',
	assets: {
        lib: {
            css: [
                'client/lib/bootstrap/dist/css/bootstrap.css',
                'client/lib/bootstrap/dist/css/bootstrap-theme.css',
                'client/lib/font-awesome/css/font-awesome.css',
                'client/lib/angular-growl-v2/build/angular-growl.min.css'
            ],
            js: [
                'client/lib/jquery/dist/jquery.min.js',
                'client/lib/jquery-ui/jquery-ui.min.js',
                'client/lib/angular/angular.js',
                'client/lib/angular-ui-router/release/angular-ui-router.js',
                'client/lib/angular-ui-scroll/dist/ui-scroll.min.js',
                'client/lib/angular-ui-event/dist/event.min.js',
                'client/lib/angular-ui-scrollpoint/dist/scrollpoint.min.js',
                'client/lib/angular-ui-mask/dist/mask.min.js',
                'client/lib/angular-ui-validate/dist/validate.min.js',
                'client/lib/angular-ui-indeterminate/dist/indeterminate.min.js',
                'client/lib/angular-ui-uploader/dist/uploader.min.js',
                'client/lib/angular-ui-utils/index.js',
                'client/lib/angular-bootstrap/ui-bootstrap-tpls.js',
                'client/lib/angular-socket-io/socket.js',
                'client/lib/angular-resource/angular-resource.js',
                'client/lib/lodash/lodash.js',
				'client/lib/async/lib/async.js',
				'client/lib/moment/min/moment.min.js',
                'client/lib/ng-file-upload/ng-file-upload.min.js',
                'client/lib/ng-file-upload-shim/ng-file-upload-shim.min.js',
                'client/lib/angular-growl-v2/build/angular-growl.min.js',
                'client/lib/angular-ui-sortable/sortable.min.js'
            ]
        },
		css: 'client/dist/application.min.css',
		js: 'client/dist/application.min.js'
	}
};
