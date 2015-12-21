'use strict';

module.exports = function(grunt) {
	// Unified Watch Object
	var watchFiles = {
		serverViews: ['server/views/**/*.*'],
		serverJS: ['gruntfile.js', 'app.js', 'config/**/*.js', 'server/**/*.js'],
		clientViews: ['client/modules/**/views/**/*.html'],
		clientJS: ['client/*.js', 'client/modules/**/*.js'],
		clientCSS: ['client/modules/**/*.css']
	};

	// Project Configuration
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		watch: {
			serverViews: {
				files: watchFiles.serverViews,
				options: {
					livereload: true
				}
			},
			serverJS: {
				files: watchFiles.serverJS,
				tasks: ['jshint'],
				options: {
					livereload: true
				}
			},
			clientViews: {
				files: watchFiles.clientViews,
				options: {
					livereload: true
				}
			},
			clientJS: {
				files: watchFiles.clientJS,
				tasks: ['jshint'],
				options: {
					livereload: true
				}
			},
			clientCSS: {
				files: watchFiles.clientCSS,
				tasks: ['csslint'],
				options: {
					livereload: true
				}
			}
		},
		jshint: {
			all: {
				src: watchFiles.clientJS.concat(watchFiles.serverJS).concat(watchFiles.mapData),
				options: {
					jshintrc: true
				}
			}
		},
		csslint: {
			options: {
				csslintrc: '.csslintrc'
			},
			all: {
				src: watchFiles.clientCSS.concat(watchFiles.clientBootStrapCss)
			}
		},
		uglify: {
			production: {
				options: {
					mangle: false
				},
				files: {
					'client/dist/application.min.js': 'client/dist/application.js'
				}
			}
		},
		cssmin: {
			combine: {
				files: {
					'client/dist/application.min.css': '<%= applicationCSSFiles %>'
				}
			}
		},
        nodemon: {
			dev: {
				script: 'app.js',
				options: {
					nodeArgs: ['--debug'],
					ext: 'js,html',
					watch: watchFiles.serverViews.concat(watchFiles.serverJS)
				}
			}
		},
		'node-inspector': {
			custom: {
				options: {
					'web-port': 1337,
					'web-host': 'localhost',
					'debug-port': 2345,
					'save-live-edit': true,
					'no-preload': true,
					'stack-trace-limit': 50,
					'hidden': []
				}
			}
		},
        ngmin: {
            production: {
                files: {
                    'client/dist/application.js': '<%= applicationJavaScriptFiles %>'
                }
            }
        },
		concurrent: {
			default: ['nodemon', 'watch'],
			debug: ['nodemon', 'watch', 'node-inspector'],
			options: {
				logConcurrentOutput: true
			}
		},
		env: {
			test: {
				NODE_ENV: 'test'
			},
			secure: {
				NODE_ENV: 'secure'
			},
			development: {
				NODE_ENV: 'development'
			}
		},
        bootlint: {
            options: {
                stoponerror: false,
                relaxerror: []
            },
            files: 'client/modules/**/views/**/*.html'
        },
		obfuscator: {
			files: [
				'client/dist/application.min.js'
			],
			entry: 'app.js',
			out: 'client/dist/obfuscated.js',
			strings: true,
			root: __dirname
		}
	});

	// Load NPM tasks
	require('load-grunt-tasks')(grunt);

	// Making grunt default to force in order not to break the project.
    grunt.option('force', true);

	// A Task for loading the configuration object
	grunt.task.registerTask('loadConfig', 'Task that loads the config into a grunt option.', function() {
		var config = require('./config/config');

		grunt.config.set('applicationJavaScriptFiles', config.assets.js);
		grunt.config.set('applicationCSSFiles', config.assets.css);
	});

	// Default task(s).
	grunt.registerTask('default', ['lint', 'concurrent:default']);

	// Default task(s).
	grunt.registerTask('dev', ['env:development', 'lint', 'concurrent:default']);

	// Debug task.
	grunt.registerTask('debug', ['env:test', 'lint', 'concurrent:debug']);

	// Lint task(s).
	grunt.registerTask('lint', ['jshint', 'csslint']);

	// Build task(s).
	grunt.registerTask('build', ['lint', 'loadConfig', 'ngmin', 'uglify', 'cssmin']);

    // Secure Debug task.
	grunt.registerTask('secure', ['env:secure', 'lint', 'concurrent:default']);
};
