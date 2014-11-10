/*
 * grunt-picasa
 * https://github.com/kennyjackelen/grunt-picasa
 *
 * Copyright (c) 2014 Kenny Jackelen
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('picasa', 'The best Grunt plugin ever.', function() {

    var done = this.async();

    function buildHTML( album ) {
      var html = '';
      html += '---\n';
      html += 'layout: post\n';
      html += 'title: ' + album.caption + '\n';
      html += '---\n';
      html += '<photo-album>\n';
      for ( var i in album.photos ) {
        var photo = album.photos[ i ];
        html += ' <photo-album-photo\n';
        html += '  thumbnail="' + photo.thumbnail + '"\n';
        html += '  src="' + photo.src + '"\n';
        html += '  caption="' + photo.caption + '">\n';
        html += ' </photo-album-photo>\n';
      }
      html += '</photo-album>\n';
      return html;
    }

    function readyCallback( success, results ) {
      if ( !success ) {
        grunt.log.error( results );
        done();
        return;
      }

      var albums = results.albums;
      for ( var i in albums ) {
        var album = albums[ i ];
        var albumDate = new Date( album.earlyTimestamp );
        var y = albumDate.getFullYear();
        var m = albumDate.getMonth() + 1;  // +1 since getMonth returns 0 for January
        var d = albumDate.getDate();
        var filePath = this.data.src + '/_posts/' + y + '-' + m + '-' + d +  // jshint ignore:line
                        '-' + album.caption.toLowerCase().replace(' ', '-') +
                        '.html';
        grunt.file.write( filePath, buildHTML( album ) );
      }
      done();
    }
    var photoLoader = require('./lib/picasa')( grunt, this.data.config );

    photoLoader.on( 'ready', readyCallback.bind( this ) );

  } );
};