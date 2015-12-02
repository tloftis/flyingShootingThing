'use strict';

/**
 * Module dependencies.
 */
var log = require('../../../config/logger'),
    moment = require("moment"),
    request = require('request'),
    path = require('path'),
    fs = require('fs'),
    mv = require('mv'),
    _ = require('lodash'),
    async = require('async'),
    ffmetadata = require("ffmetadata"),
    podcastPath = 'client/media/podcasts',
    downloading = false;

var _getAllFilesFromFolder = function(dir) {
    var results = [];

    fs.readdirSync(dir).forEach(function(file) {
        file = dir+'/'+file;
        var stat = fs.statSync(file);

        if (stat && stat.isDirectory()) {
            results = results.concat(_getAllFilesFromFolder(file))
        } else results.push(file);

    });

    return results;
};

exports.listCasts = function(req, res){
    var casts = _getAllFilesFromFolder(podcastPath);

    casts = casts.map(function(cast){
        cast = cast.split('/');
        cast.shift();
        return cast.join('/');
    });

    return res.jsonp(casts);
};

exports.updateCasts = function(req, res) {
    if(downloading){
        return res.status(400).send({
            message: 'Already updating'
        });
    }else{
        res.jsonp('Starting download, this will take a moment');
    }

    downloading = true;

    var podcasts = [];
    var itter = 0;
    var ops = [];

    var mp3LnkRg = /http:\/\/wrif.com([a-z]|[A-Z]|[0-9]|-|\/|\.)*\.mp3/g;
    var mp3NameRg = /([a-z]|[A-Z]|[0-9]|-|\.)*(?=\.mp3)/g;
    var descriptRg = /"podcast__desc">(([^<>])*(?=(<\/div>)))/;
    var descriptWMp3Rg = /"podcast__desc">(.)*(.mp3)/g;

    while(itter <= 0){
        itter++;

        ops.push({
            url: 'http://wrif.com/shows/dave-and-chuck/podcasts/page/' + itter + '/?ajax=1&partial_slug=partials%2Floop-gmr_podcast&partial_name=',
            "rejectUnauthorized": false
        });
    }

    async.each(ops, function (op, next) {
        request.get(op, function (error, response, body) {
            if (!error && response.statusCode == 200 && body) {
                body = JSON.parse(body);
                var descriptsM = body.html.match(descriptWMp3Rg);

                if(descriptsM !== null){
                    for(var i =0; i < descriptsM.length; i++){
                        var podcast = descriptsM[i];

                        var link = podcast.match(mp3LnkRg);
                        var mp3Name = (link === null) ? null: link[0].match(mp3NameRg);
                        var descript = podcast.match(descriptRg);

                        if((mp3Name !== null) && (mp3Name[0] !== 'daveandchuck'))
                            podcasts.push({
                                link: (link === null) ? null : link[0],
                                mp3Name: (mp3Name === null) ? null :mp3Name[0],
                                description: (descript === null) ? null : descript[1],
                                raw: podcast
                            });
                    }
                }
            }

            next(error);
        });
    },
    function(err){
        var podcastsTemp = _.sortBy( podcasts, 'mp3Name' ).reverse();
        podcasts = [];
        podcasts.push(podcastsTemp[0]);
        podcasts.push(podcastsTemp[1]);

        async.each(podcasts, function (podcast, next) {
                console.log('Now Downloading ' + podcast.mp3Name + '.....');

                download(podcast, function(err){
                    if (err)
                        console.log('Error Downloading ' + podcast.mp3Name + '!');
                    else
                        console.log('Downloaded ' + podcast.mp3Name + '!');

                    next(err);
                });
            },
            function(err){
                console.log('\nApplying Metadata\n');

                function oneAtATime(index){
                    if(index === podcasts.length){
                        console.log('Podcasts Ready');

                        mv('source', 'dest', function(err) {
                            downloading = false;
                        });

                    }else
                        metaData(podcasts[index], function(err){
                            if (err)
                                console.log('Error writing metadata for ' + podcasts[index].mp3Name);
                            else
                                console.log('Metadata written for ' + podcasts[index].mp3Name);

                            oneAtATime(++index)
                        });
                }

                oneAtATime(0);
            })
    });

    function download(podcast, callback){
        var mp3Loc = podcast.mp3Name + '.mp3';
        callback = callback || function(){};

        downloader(podcast.link, mp3Loc, callback);
    }

    function downloader(url, path, callback) {
        request({uri: url})
            .pipe(fs.createWriteStream(path))
            .on('close', function(err) {
                callback(err);
            })
            .on('error', function(err){
                console.log('error downloading');
                callback();
            });
    }

    function metaData(podcast, callback){
        callback = callback || function(){};
        var mp3Loc = podcast.mp3Name + '.mp3';

        var options = {
            attachments: ['client/modules/core/img/brand/Podcast-Image1.jpg'],
            'id3v2.3': true
        };

        var date = podcast.mp3Name.match(/([0-9])*(?=([a-z]|[A-Z]))/g)[0];
        var dateYear = date.substr(date.length - 4);

        var data = {
            artist: 'Dave & Chuck (The Freak)',
            title: podcast.mp3Name,
            comments: podcast.description,
            date:  dateYear
        };

        ffmetadata.write(mp3Loc, data, options, function(){
            mv(mp3Loc, podcastPath + '/' + mp3Loc, {mkdirp: true}, callback);
        });
    }
};
