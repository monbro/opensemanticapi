var Db = require('./db');
var Analyse = require('./analyse');
var restify = require('restify');
var config = require('../config.js');

var Scraper = function() {
    db = new Db();
    analyse = new Analyse();
    that = this;
    debug_once = false;
    wikipedia = restify.createJsonClient({
      url: 'http://'+config.creds.lang+'.wikipedia.org',
      version: '*'
    });
};

Scraper.prototype.wikiSearch = function(s) {
    if(config.creds.debug) {
        console.log('wikiSearch with: '+s);
    }

    // check if not empty string
    if(typeof s == 'undefined' || s === '' || debug_once) {
        console.log('wikiSearch - the given string is empty or undefined!');
        console.log('node will exit now.');
        process.exit(1);
        return;
    }

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

        if(config.creds.debug_once) {
            debug_once = true;
        }
    });
};

Scraper.prototype.wikiGrab = function(s) {
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
};

Scraper.prototype.loopWorker = function(snippets) {
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

    analyse.scanTextBlock(snippets.pop(),snippets.length,function() {
        var t=setTimeout(function(){that.loopWorker(snippets);},config.creds.sleeptime);
    });
};

Scraper.prototype.goToNext = function() {
    if(config.creds.debug) {
        console.log('goToNext');
    }
    db.getRandomItemFromQueue(that.wikiSearch);
};

module.exports = Scraper;