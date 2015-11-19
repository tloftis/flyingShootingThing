'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	User = mongoose.model('User');

/**
 * Update user details
 */
exports.updateMe = function(req, res) {
    var user = req.user;

    var message = null;

    delete req.body.roles;

    if (user) {
        user = _.extend(user, req.body);
        user.updated = Date.now();
        user.displayName = user.firstName + ' ' + user.lastName;

        user.save(function(err) {
            if (err) {
                return res.status(400).send({
                    message: err.message
                });
            } else {
                req.login(user, function(err) {
                    if (err) {
                        res.status(400).send(err);
                    } else {
                        res.jsonp(user);
                    }
                });
            }
        });
    } else {
        res.status(400).send({
            message: 'User is not signed in'
        });
    }
};


/**
 * Update user details
 */
exports.updateUser = function(req, res) {
    var user = req.profile;
    var message = null;

    if (req.body.badge === '') {
        req.body.badge = null;
    }

    if(req.body.roles === '')
    {
        res.status(400).send({
            message: 'User Role is not defined'
        });
    }
    else if (user) {
        // Merge existing user

        user = _.extend(user, req.body);
        user.updated = Date.now();
        user.displayName = user.firstName + ' ' + user.lastName;
        //console.log('edited:' + user);

        user.save(function(err) {
            if (err) {
                return res.status(400).send({
                    message: err.message
                });
            } else {
                res.jsonp(user);
            }
        });
    } else {
        res.status(400).send({
            message: 'User is not defined'
        });
    }
};


/**
 * List of Users
 */
exports.list = function(req, res) {


    User.find({deleted:'false'})
        .sort('-created')
        .select('_id roles username displayName enabled created')
        .exec(function(err, users) {
            if (err) {
                //console.log(users);
                return res.status(400).send({
                    message: err.message
                });
            } else {
                res.jsonp(users);
            }
        });

};

/**
 * Delete an User
 */
exports.delete = function(req, res) {
    var user = req.profile;
    user.deleted = user._id;
    user.save(function(err) {
        if (err) {
            //console.log(err);
            return res.status(400).send({
                message: err.message
            });
        } else {
            res.jsonp(user);
        }
    });
};

/**
 * Send the Loggedin User
 */
exports.me = function(req, res) {
	res.jsonp(req.user || null);
};

/**
 * Show the User to be edited
 */
exports.read = function(req, res) {
    res.jsonp(req.profile);
};

/**
 * User middleware
 */
exports.userByID = function(req, res, next, id) {

    if (!req.objectIdRegEx.test(id)) {
        return next('route');
    }

    User.findOne({
        _id: id
    })
        .select('_id created lastName firstName displayName roles __v username provider enabled email badge')
        .exec(function(err, user) {
        if (err) return next(err);
        if (!user) return next(new Error('Failed to load User ' + id));
        req.profile = user;
        next();
    });
};
