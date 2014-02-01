'use strict';

var require = require || {};
var module = module || {};
var console = console || {};
var process = process || {};
var escape = escape || {};

var Db = require('./db');
var Analyse = require('./analyse');
var restify = require('restify');
var config = require('../config.js');
var $ = require("jquery");

var db, analyse, that, debugOnce, wikipedia;

var Scraper = {

    init: function() {
        db = Db;
        db.init();
        analyse = Analyse;
        analyse.init();
        that = this;
        debugOnce = false;
        wikipedia = restify.createJsonClient({
          url: 'http://'+config.creds.lang+'.wikipedia.org',
          version: '*'
        });
    },

    wikiSearch: function(s) {
        if(config.creds.debug) {
            console.log('wikiSearch');
        }

        // check if not empty string
        if(typeof s == 'undefined' || s === '' || debugOnce) {
            console.log('wikiSearch - the given string is empty or undefined!');
            console.log('node will exit now.');
            process.exit(1);
            return;
        }

        console.log('http://'+config.creds.lang+'.wikipedia.org/w/api.php?action=opensearch&search='+escape(s)+'&format=json&limit=3');

        wikipedia.get('/w/api.php?action=opensearch&search='+escape(s)+'&format=json&limit=3', function(err, req, res, data) {
            if(typeof data[1] == 'undefined' || typeof data[1][0] == 'undefined') {
              if(config.creds.debug) {
                console.log('No page found in wikipedia for '+req.path);
              }
              db.removePageFromQueue(s);
              that.goToNext();
              return;
            }

            // get first matching result
            var firstTitle = data[1][0];

            // set first result as done
            db.addPageAsDone(firstTitle,function (err, result) {
                if(config.creds.debug) {
                    console.log('addPageAsDone callback');
                }
                if(result) {
                    that.wikiGrab(firstTitle);
                    db.removePageFromQueue(firstTitle);
                }
                else {
                    if(config.creds.debug) {
                        console.log(firstTitle+' was crawled already!');
                    }
                    that.goToNext();
                    return false;
                }
            });

            // add all sites to queue
            for (var i = data[1].length - 1; i >= 0; i--) {
              console.log('Added '+data[1][i]+' to queue!');
              db.addPageToQueue(data[1][i]);
            }

            if(config.creds.debug) {
                debugOnce = true;
            }
        });
    },

    wikiGrab: function(s) {
        if(config.creds.debug) {
            console.log('wikiGrab with '+s);
        }
        wikipedia.get('/w/api.php?rvprop=content&format=json&prop=revisions|categories&rvprop=content&action=query&titles='+escape(s), function(err, req, res, data) {
            if(typeof data.query == 'undefined') {
              that.goToNext();
              return false;
            }

            // check if valid content
            if(typeof data.query.pages[Object.keys(data.query.pages)[0]].revisions == 'undefined') {
              that.goToNext();
              return false;
            }

            // get the main content of the wikipedia page
            var rawtext = data.query.pages[Object.keys(data.query.pages)[0]].revisions[0]["*"];
             // now split the whole content into text blocks
            var parts = rawtext.split(/\n|\r/);
            var snippets = [];

            if(config.creds.debug) {
                console.log('going to http://'+config.creds.lang+'.wikipedia.org/wiki/'+s);
            }

            // loop all text blocks and pull these with more than config.creds.min_text_block_length (default: 120) chars
            for (var i = parts.length - 1; i >= 0; i--) {
              if(parts[i].length > config.creds.min_text_block_length) {
                snippets.push(parts[i]);
              }
            }

            console.log('Will now process "'+s+'" with '+snippets.length+' text blocks.');

            if(snippets.length > 0) {
              // give the loop worker something to do
              that.loopWorker(snippets);
            }
            else {
              // restart fetch
              that.goToNext();
            }

        });
    },

    loopWorker: function(snippets) {
        if(config.creds.debug) {
            console.log('loopWorker');
        }
        // when snippetbox is empty, restart fetch
        if(snippets.length === 0) {
            if(config.creds.debug) {
                console.log('Finished all Snippets!');
            }
            that.goToNext();
            return;
        }

        // analyze full text block
        $.when(analyse.scanTextBlock(snippets.pop(),snippets.length)).done(function() {
            // set a timeout to be gently to the memory and cpu 
            // (can be changed in the config file)
            var t=setTimeout(function(){that.loopWorker(snippets);},config.creds.sleeptime);
        });
    },

    goToNext: function() {
        if(config.creds.debug) {
            console.log('goToNext');
        }
        db.getRandomItemFromQueue(that.wikiSearch);
    }

};

module.exports = Scraper;