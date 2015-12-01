'use strict';

/**
 * Module dependencies.
 */
var log = require('../../../config/logger'),
    moment = require("moment"),
    request = require('request'),
    path = require('path'),
    fs = require('fs'),
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
    console.log(casts);

    casts = casts.map(function(cast){
        cast = cast.split('/');
        cast.shift();
        return cast.join('/');
    });

    console.log(casts);

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
            "rejectUnauthorized": false,
            headers: {
                'Accept': '*/*',
                'Referer': 'http://wrif.com/shows/dave-and-chuck/podcasts/',
                'X-Requested-With': 'XMLHttpRequest',
                'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.101 Safari/537.36',
                'Accept-Encoding': 'gzip, deflate, sdch',
                'Accept-Language': 'en-US,en;q=0.8',
                'Cookie': '__cfduid=deea2f41b545d983e41ac4e4d6f704a871443559212; em_cdn_uid=t%3D1443559213364%26u%3D4a2cb03ec21b435f973608dec2f0a0f5; X-Mapping-fjhppofk=29F52832132A49E616E54D2302F2CCAC; OX_sd=1; _gat=1; _ga=GA1.2.945204455.1443559214; _gat_tdapiTracker=1; OX_plg=swf|shk|pm'
            }
        });
    }

    async.each(ops, function (op, next) {
            request.get(op, function (error, response, body) {
                if (!error && response.statusCode == 200) {
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

                            downloading = false;
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
        var mp3Loc = podcastPath + '/' + podcast.mp3Name + '.mp3';
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
        var mp3Loc = podcastPath + '/' + podcast.mp3Name + '.mp3';

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

        ffmetadata.write(mp3Loc, data, options, callback);
    }
};
