var Tools = require('../lib/tools');
var Db = require('./db');
var config = require('../config.js');
var _ = require("underscore");

var Analyse = function() {
    tools = Tools;
    // tools = new Tools();
    db = new Db();
};

Analyse.prototype.scanTextBlock = function(snippet,counter, callback) {
    if(config.creds.debug) {
        console.log('scanTextBlock');
    }
    // split the text block to words
    var words = tools.tokenize(snippet);

    if(config.creds.debug) {
        console.log('Count of words in snippet ('+counter+'): '+words.length);
    }

      // create empty object
      var obj = {};
      // var multi = client.multi();
      db.enableMulti();

      // loop all words
      for (var i = words.length - 1; i >= 0; i--) {

        // count all seen words
        if(typeof obj[words[i].toLowerCase()] == 'undefined')
          obj[words[i].toLowerCase()] = 1;
        else
          obj[words[i].toLowerCase()]++;

        // add every word to the queue to spread the scrape
        // multi.sadd('____sites2do____',words[i].toLowerCase());
        db.addPageToQueue(words[i].toLowerCase());

        // if(config.creds.debug)
        //   console.log(words[i].toLowerCase()+'¥ - '+words[j].toLowerCase()+' - '+similar_text(words[i].toLowerCase(),words[j].toLowerCase(),1));
      }

      // var base;

      _.each(obj, function(value, index) {

        // skip if not valid
        if(typeof index == 'undefined' || typeof index.toLowerCase == 'undefined')
          return;

        // create new obj from class Base, make sure to work with lowercase only
        // base = new Base(index.toLowerCase());

        // loop all words
        _.each(obj, function(value2, index2) {
          if(index != index2) {
            // add relation, value2 is the counter of how often the word was seen in the recent textblock
            // base.pushRelation(index2.toLowerCase(),value2);
            db.addRelation(index.toLowerCase(),index2.toLowerCase(),value2);
          }
        });

        // base.save();

        // add to our general 'ALL' collection, to identify the most used words of all
        // multi.sadd('____all____', index.toLowerCase()); // add keyword
        // multi.incrby('____all____'+':'+index.toLowerCase(), value); // track its density
        db.addToGlobalCounter(value,index.toLowerCase());

      });

    // flush changes to database
    db.flush(function(err, replies) {
        callback();
        return true;
    });

      // multi.exec(function(err, replies) {
      //     return true;
      // });
};

module.exports = Analyse;