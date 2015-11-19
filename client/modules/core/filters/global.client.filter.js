'use strict';
angular.module('core').filter('capitalize', function () {
    return function (input) {
        if (input !== null)
            input = input.toLowerCase();
        return input.substring(0, 1).toUpperCase() + input.substring(1);
    };
}).filter('startFrom', function () {
    return function (input, start) {
        if (input) {
            start = +start;
            return input.slice(start);
        }
        return [];
    };
}).filter('trunc', function () {
    return function (value, max, tail) {
        if (!value) return '';

        max = parseInt(max, 10);
        if (!max) return value;
        if (value.length <= max) return value;
        value = value.substr(0, max - 3);
        return value + (tail || '…');
    };
}).filter('zfTransSN', function () {
    return function (value) {
        if (!value) return value;
        var pattern = '3S1[A-Z0-9]{11}$';
        var re = new RegExp(pattern, 'g');
        var sn = value.match(re);
        if (!sn) return value;

        return sn;
    };
}).filter('regex', function() {
    return function (input, field, regex) {
        var patt = new RegExp(regex);
        var out = [];
        for (var i = 0; i < input.length; i++) {
            if (patt.test(input[i][field]))
                out.push(input[i]);
        }
        return out;
    };
});