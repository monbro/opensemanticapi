'use strict';

var require = require || {};
var module = module || {};
var console = console || {};

var config = require('../config.js');
var Tools = require('../lib/tools');
var Db = require('./db');
var $ = require("jquery");

var db, tools;

var Analyse = {

  init: function() {
    tools = Tools;
    db = new Db();
    db.init();
  },

  scanTextBlock: function(snippet,counter) {
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
        db.enableMulti();

        // loop all words
        for (var i = words.length - 1; i >= 0; i--) {

          // count all seen words
          if(typeof obj[words[i].toLowerCase()] == 'undefined')
            obj[words[i].toLowerCase()] = 1;
          else
            obj[words[i].toLowerCase()]++;

          // add every word to the queue to spread the scrape
          db.addPageToQueue(words[i].toLowerCase());

          // experimental testing stuff:
          // if(config.creds.debug)
          //   console.log(words[i].toLowerCase()+'¥ - '+words[j].toLowerCase()+' - '+similar_text(words[i].toLowerCase(),words[j].toLowerCase(),1));
        }

        $.each(obj, function(index, value) {
          // skip if not valid
          if(typeof index == 'undefined' || typeof index.toLowerCase == 'undefined')
            return;

          // loop all words
          $.each(obj, function(index2, value2) {
            if(index != index2) {
              // add relation, value2 is the counter of how often the word was seen in the recent textblock
              db.addRelation(index.toLowerCase(),index2.toLowerCase(),value2);
            }
          });

          // add to our general 'ALL' collection, to identify the most used words of all
          db.addToGlobalCounter(value,index.toLowerCase());

        });

      // flush changes to database
      db.flush(function(err, replies) {
          return true;
      });
  }
    
};

module.exports = Analyse;