'use strict';

/* globals errorHandler: true*/

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	mongoose = require('mongoose'),
	User = mongoose.model('User');


/**
 * Require login routing middleware
 */
exports.requiresLogin = function(req, res, next) {
	if (!req.isAuthenticated()) {
		return res.status(401).send({
			message: 'User is not logged in'
		});
	}

	next();
};


/**
 * Check if Admin User Exists
 */
exports.adminCheck = function(req, res){

    User.find({ roles: 'admin', deleted: 'false' })
        .select('_id')
        .exec(function(err, adminUsers) {


            if (err) {
                //console.log(adminUsers);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                var adminExists = false;
                //console.log(adminUsers.length);
                if (adminUsers.length > 0)
                {adminExists = true;}
                else
                {adminExists = false;}

                res.jsonp({adminExists:adminExists});

            }
        });
};



/**
 * User authorizations routing middleware
 */
exports.hasAuthorization = function(roles) {
	var _this = this;

	return function(req, res, next) {

		_this.requiresLogin(req, res, function() {
			if (_.intersection(req.user.roles, roles).length) {
				return next();
			} else {
				return res.status(403).send({
					message: 'User is not authorized'
				});
			}
		});
	};
};
