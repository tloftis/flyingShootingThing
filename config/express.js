'use strict';

/**
 * Module dependencies.
 */
var express = require('express'),
    http = require('http'),
    https = require('https'),
    morgan = require('morgan'),
    logger = require('./logger'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    compress = require('compression'),
    methodOverride = require('method-override'),
    cookieParser = require('cookie-parser'),
    helmet = require('helmet'),
    passport = require('passport'),
    mongoStore = require('connect-mongo')({
        session: session
    }),
	fs = require('fs'),
    flash = require('connect-flash'),
    config = require('./config'),
    consolidate = require('consolidate'),
    path = require('path');
// Initialize server
var server;

/**
 * Redirect insecure connections to the defined secure port
 */
if (+process.env.REDIRECT_INSECURE_HTTP) {

    // set up plain http server
    var app = express(),
        insecureServer = http.createServer(app),
        port = '';
    if (config.port !== 443) {
        port = ':' + config.port;
    }

    // set up a route to redirect http to https
    app.get('*', function(req, res){
        res.redirect('https://' + req.headers.host + port + req.url);
    });
    app.listen(80);

    console.log('Redirecting insecure traffic from port 80 to: https://localhost:' + port);
}

module.exports = function(db) {

	// Initialize express app
	var app;
	var io;

    app = express();

    //Only using http right now as it doesn't actually matter for such a simple thing

	if(process.env.APP_SSL_PFX) {
		server = https.createServer({
			pfx: fs.readFileSync(path.join(__dirname, process.env.APP_SSL_PFX))
		}, app);
	}else
    	server = http.createServer(app);


    io = require('socket.io').listen(server);

    // Globbing all server model
    config.getGlobbedFiles('./server/modules/**/*.model.js').forEach(function(modelPath) {
        require(path.resolve(modelPath));
    });

    // Globbing custom model files
    config.getGlobbedFiles('./server/lib/**/*.model.js').forEach(function(modelPath) {
        require(path.resolve(modelPath));
    });

	// Setting application local variables
	app.locals.title = config.app.title;
    app.locals.version = require('../package.json').version;
	app.locals.description = config.app.description;
	app.locals.keywords = config.app.keywords;
	app.locals.jsFiles = config.getJavaScriptAssets();
	app.locals.cssFiles = config.getCSSAssets();
    app.locals.objectIdRegEx =  new RegExp(/^[0-9a-fA-F]{24}$/);
    app.use(function(req, res, next) {
        res.locals.io = io;
        req.objectIdRegEx =  app.locals.objectIdRegEx;
        next();
    });

	// Passing the request url to environment locals
	app.use(function(req, res, next) {
        res.locals.url = req.protocol + '://' + req.headers.host + req.url;
		next();
	});

	// Should be placed before express.static
	app.use(compress({
		filter: function(req, res) {
			return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
		},
		level: 9
	}));

	// Showing stack errors
	app.set('showStackError', true);

    app.set('superSecret', config.sessionSecret); // secret variable

	// Set swig as the template engine
	app.engine('server.view.html', consolidate[config.templateEngine]);

	// Set views path and view engine
	app.set('view engine', 'server.view.html');
	app.set('views', './server/views');

    // Enable logger (morgan)
    app.use(morgan('combined', { 'stream': logger.stream }));

	// Environment dependent middleware
	if (process.env.NODE_ENV === 'development') {
		// Disable views cache
		app.set('view cache', false);
	} else if (process.env.NODE_ENV === 'production') {
		app.locals.cache = 'memory';
	}

	// Request body parsing middleware should be above methodOverride
	app.use(bodyParser.urlencoded({
		extended: true
	}));

    app.use(methodOverride());
	//app.use(bodyParser.urlencoded({limit: '50mb'}));
	app.use(bodyParser.json({limit: '150mb'}));

	// Enable jsonp
	app.enable('jsonp callback');

	// CookieParser should be above session
	app.use(cookieParser());

	// Express MongoDB session storage
	app.use(session({
		saveUninitialized: true,
		resave: true,
        secret: 'FAPLANEGAME',
		store: new mongoStore({
            mongooseConnection: db.connection,
			collection: config.sessionCollection
		})
	}));

	// use passport session
	app.use(passport.initialize());
	app.use(passport.session());

	// connect flash for flash messages
	app.use(flash());

	// Use helmet to secure Express headers
	app.use(helmet.xframe());
	app.use(helmet.xssFilter());
	app.use(helmet.nosniff());
	app.use(helmet.ienoopen());
	app.disable('x-powered-by');

	// Setting the app router and static folder
	app.use(express.static(path.resolve('./client')));


	//Globbing routing files
	config.getGlobbedFiles('./server/modules/**/*.routes.js').forEach(function(routePath) {
		require(path.resolve(routePath))(app);
	});

    // Globbing custom routing files
    config.getGlobbedFiles('./server/lib/**/*.routes.js').forEach(function(routePath) {
        require(path.resolve(routePath))(app);
    });

	//Globbing routing files
	config.getGlobbedFiles('./server/modules/**/*.sockets.js').forEach(function(routePath) {
		require(path.resolve(routePath))(io);
	});

	// Assume 'not found' in the error msgs is a 404. this is somewhat silly, but valid, you can do whatever you like, set properties, use instanceof etc.
	app.use(function(err, req, res, next) {
		// If the error object doesn't exists
		if (!err) return next();

		// Log it
		console.error(err.stack);
        console.error(err.message);

		// Error page
		res.status(500).send({message: err.message});
	});

	// Assume 404 since no middleware responded
	app.use(function(req, res) {
        res.status(404).send({message: req.originalUrl + ' Is an invalid Route and Not Found!'});
	});

	return server;
};
