'use strict';

var users = require('./users.server.controller.js'),
    apiVer = process.env.API_VERSION;

module.exports = function(app) {
    //########################## User Routes ###################################/
    // Setting up the users profile api
    app.route('/api/users/me')
        .get(users.me);
    app.route('/api/users')
        .get(users.list)
        .put(users.updateMe);


    app.route('/api/users/accounts')
        .delete(users.removeOAuthProvider);

    // Setting up the users password api
    app.route('/api/users/password').post(users.changePassword);
    app.route('/api/auth/forgot').post(users.forgot);
    app.route('/api/auth/reset/:token').get(users.validateResetToken);
    app.route('/api/auth/reset/:token').post(users.reset);

    // Setting up the users authentication api
    app.route('/api/auth/signup').post(users.signup);
    app.route('/api/auth/signin').post(users.signin);
    app.route('/auth/signout').get(users.signout);
    app.route('/api/auth/validate').post(users.validate);



    app.route('/api/users/:editUserId')
        .get(users.requiresLogin, users.hasAuthorization(['admin']), users.read)
        .put(users.requiresLogin, users.hasAuthorization(['admin']), users.updateUser)
        .delete(users.requiresLogin, users.hasAuthorization(['admin']), users.delete);

    app.route('/api/initialUser/')
        .get(users.adminCheck);

    // Finish by binding the user middleware
    app.param('editUserId', users.userByID);
    //########################## User Routes ###################################/
};
