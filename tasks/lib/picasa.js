'use strict';

module.exports = function( grunt, config ) {

  var EventEmitter = require('events').EventEmitter;
  var emitter = new EventEmitter();

  loadPhotos( grunt, config, emitter );

  return emitter;
};

function loadPhotos( grunt, config, emitter ) {

  var request = require('request');
  var async = require('async');
  var google = require('googleapis');
  var _accessToken;
  var _config = config;

  var oauth2Client = new google.auth.OAuth2( config.CLIENT_ID,
                                              config.CLIENT_SECRET,
                                              config.REDIRECT_URL );

  oauth2Client.setCredentials({
    refresh_token: config.REFRESH_TOKEN
  });

  oauth2Client.refreshAccessToken( gotToken );

  function gotToken( error, tokens ) {
    if ( error ) {
      emitter.emit( 'ready', false, { error: error } );
      return;
    }

    _accessToken = tokens.access_token;
    getAlbumsList();

  }

  function getAlbumsList() {
    var albumListURL = 'https://picasaweb.google.com/data/feed/api/user/' + 
                        _config.PICASA_USER_ID + '?alt=json&access_token=' +
                        _accessToken
    var requestOptions = 
      {
        url: albumListURL,
        json: true
      };

    request( requestOptions, gotAlbumsList );

  }

  function gotAlbumsList( error, response, body ) {
    if (error || response.statusCode !== 200) {
      emitter.emit( 'ready', false, { error: error, statusCode: response.statusCode } );
      return;
    }

    var albums = body.feed.entry;
    var albumOps = [];

    for ( var i in albums ) {
      var album = albums[ i ];
      if ( album.gphoto$albumType ) {
        // Profile Photos, Instant Upload, and DropBox have album types.
        // I don't care about these albums, so I skip them.
        continue;
      }
      var closure = makeGetPhotoListClosure( album.gphoto$id.$t );
      albumOps.push(closure
      );
    }

    async.series( albumOps, processedAllAlbums );
  }

  function makeGetPhotoListClosure( albumID ) {
    return function( callback ) { 
      getPhotoList( albumID, callback );
    }
  }

  function getPhotoList( albumID, asyncCallback ) {
    var photoListURL =  'https://picasaweb.google.com/data/feed/api/user/' + 
                        _config.PICASA_USER_ID + '/albumid/' + albumID +
                        '?alt=json&thumbsize=104c&imgmax=1600&access_token=' +
                        _accessToken;
    var requestOptions = 
      {
        url: photoListURL,
        json: true
      };

    request( requestOptions, gotPhotoList.bind( this, albumID, asyncCallback ) );

  }

  function gotPhotoList( albumID, asyncCallback, error, response, body ) {
    if (error || response.statusCode !== 200) {
      asyncCallback( { error: error, statusCode: response.statusCode } );
      return;
    }

    var photos = body.feed.entry;
    var albumData = {};
    albumData.photos = [];

    albumData.albumID = body.feed.gphoto$id.$t;
    albumData.caption = body.feed.title.$t;

    for ( var i in photos ) {
      var photoData = {};
      var photo = photos[ i ];
      var mediaGroup = photo.media$group;
      var timestamp = parseInt( photo.gphoto$timestamp.$t );
      photoData.thumbnail = mediaGroup.media$thumbnail[ 0 ].url;
      photoData.src = mediaGroup.media$content[ 0 ].url;
      photoData.caption = mediaGroup.media$description.$t;
      albumData.photos.push( photoData );
      if ( albumData.earlyTimestamp === undefined
            || timestamp < albumData.earlyTimestamp ) {
        albumData.earlyTimestamp = timestamp;
      }
      if ( albumData.lateTimestamp === undefined
            || timestamp > albumData.lateTimestamp ) {
        albumData.lateTimestamp = timestamp;
      } 
    }

    asyncCallback( null, albumData );

  }

  function processedAllAlbums( error, results ) {
    if ( error ) {
      emitter.emit( 'ready', false, { error: error } );
      return;
    }
    emitter.emit( 'ready', true, { albums: results } );
  }

}

