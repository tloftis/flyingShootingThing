'use strict';

module.exports = {
	app: {
		title: 'FA Plane Game',
		description: 'just a simple side scrolling plane shooting game',
		keywords: 'game, plane, font-awesome'
	},
	port: process.env.PORT || 3000,
	templateEngine: 'swig',
	sessionCollection: 'sessions',
	assets: {
		lib: {
			css: [
				'client/lib/bootstrap/dist/css/bootstrap.css',
				'client/lib/bootstrap/dist/css/bootstrap-theme.css',
                'client/lib/font-awesome/css/font-awesome.css',
                'client/lib/angular-growl-v2/build/angular-growl.min.css'
			],
			js: [
				'client/lib/angular/angular.js',
				'client/lib/angular-ui-router/release/angular-ui-router.js',
				'client/lib/angular-bootstrap-multiselect/angular-bootstrap-multiselect.js',
				'client/lib/angular-ui-scroll/dist/ui-scroll.js',
				'client/lib/angular-ui-event/dist/event.js',
				'client/lib/angular-ui-scrollpoint/dist/scrollpoint.js',
				'client/lib/angular-ui-mask/dist/mask.js',
				'client/lib/angular-ui-validate/dist/validate.js',
				'client/lib/angular-ui-indeterminate/dist/indeterminate.js',
				'client/lib/angular-ui-uploader/dist/uploader.js',
				'client/lib/angular-ui-utils/index.js',
				'client/lib/angular-bootstrap/ui-bootstrap-tpls.js',
                'client/lib/angular-socket-io/socket.js',
				'client/lib/angular-resource/angular-resource.js',
                'client/lib/socket.io-client/socket.io.js',
                'client/lib/lodash/lodash.js',
				'client/lib/async/lib/async.js',
                'client/lib/angular-ui-tree/dist/angular-ui-tree.js',
				'client/lib/moment/min/moment.min.js',
                'client/lib/ng-file-upload/ng-file-upload.min.js',
                'client/lib/ng-file-upload-shim/ng-file-upload-shim.min.js',
                'client/lib/angular-growl-v2/build/angular-growl.min.js',
                'client/lib/angular-ui-sortable/sortable.js'
			]
		},
		css: [
			'client/modules/**/css/*.css'
		],
		js: [
			'client/config.js',
			'client/application.js',
			'client/modules/*/*.js',
			'client/modules/*/*[!tests]*/*.js'
		],
		tests: [
			'client/modules/*/tests/*.js'
		]
	}
};
