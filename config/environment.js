'use strict';

var fs = require('fs');
var path = require('path');

module.exports = function(){

    require('dotenv').load();

    // regex ignores `#`
    var missing = fs.readFileSync(path.resolve(__dirname, '..', '.envtemplate'), 'utf-8')
        .match(/^(\w+)/gm)
        .filter(function(key){
            return !process.env[key];
        });

    if (missing.length) {
        console.error('\nMissing environment variable' + (missing.length === 1 ? '' : 's') + ': ' + missing.join(', '));
        process.exit(1);
    }

};