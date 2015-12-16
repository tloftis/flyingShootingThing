'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var UserPlaneSchema = new Schema({
    speedVert: {
        type: Number,
        required: 'Missing Vertical Speed',
        trim: true
    },
    speedHoz: {
        type: Number,
        required: 'Missing Horizontal Speed',
        trim: true
    },
    length: {
        type: Number,
        required: 'Missing Length in %',
        trim: true
    },
    width: {
        type: Number,
        required: 'Missing Width in %',
        trim: true
    },
    class: {
        type: String,
        required: 'Missing Plane Class',
        trim: true
    },
    created: {
        type: Date,
        default: Date.now
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    }
});

var EnemyPlaneSchema = new Schema({
    speedVert: {
        type: Number,
        required: 'Missing Vertical Speed',
        trim: true
    },
    speedHoz: {
        type: Number,
        required: 'Missing Horizontal Speed',
        trim: true
    },
    length: {
        type: Number,
        required: 'Missing Length in %',
        trim: true
    },
    width: {
        type: Number,
        required: 'Missing Width in %',
        trim: true
    },
    pointVal: {
        type: Number,
        required: 'Missing point value',
        trim: true
    },
    class: {
        type: String,
        required: 'Missing Plane Class',
        trim: true
    },
    ammoType: {
        type: Schema.ObjectId,
        ref: 'EnemyAmmo'
    },
    created: {
        type: Date,
        default: Date.now
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    }
});

var EnemyAmmoSchema = new Schema({
    speed: {
        type: Number,
        required: 'Missing Speed',
        trim: true
    },
    length: {
        type: Number,
        required: 'Missing Length in %',
        trim: true
    },
    width: {
        type: Number,
        required: 'Missing Width in %',
        trim: true
    },
    name: {
        type: String,
        required: 'Missing a name for the Ammo',
        trim: true
    },
    class: {
        type: String,
        required: 'Missing Plane Class',
        trim: true
    },
    created: {
        type: Date,
        default: Date.now
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    }
});

var PlayerAmmoSchema = new Schema({
    speed: {
        type: Number,
        required: 'Missing Speed',
        trim: true
    },
    length: {
        type: Number,
        required: 'Missing Length in %',
        trim: true
    },
    width: {
        type: Number,
        required: 'Missing Width in %',
        trim: true
    },
    name: {
        type: String,
        required: 'Missing a name for the Ammo',
        trim: true
    },
    class: {
        type: String,
        required: 'Missing Plane Class',
        trim: true
    },
    created: {
        type: Date,
        default: Date.now
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    }
});

mongoose.model('PlayerAmmo', PlayerAmmoSchema);
mongoose.model('EnemyAmmo', EnemyAmmoSchema);
mongoose.model('UserPlane', UserPlaneSchema);
mongoose.model('EnemyPlane', EnemyPlaneSchema);