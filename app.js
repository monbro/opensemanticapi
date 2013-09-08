
/**
 * This class will scrape wikipedia articles and build out of it a datamase which can be searched in a semantic way.
 * The density count of keywords in a small local place (textblock) allows us to detect related keywords in a semantic way
 *
 * @author Michael Klein <klein@monbro.de>
 * @url http://open-semantic.com/
 * @package opensemanticapi
 * @version 0.1
 */

/* Used variables names
 * ____sites____ = wikipedia page titles which were scraped already
 * ____sites2do____ = wikipedia page titles which are queued to scrape
 * ____all____ = a collection of all ever seen words with a increment number
 */

/** 
 * Modules
 */
var restify = require('restify');
var express = require('express');
var config = require('./config.js');
var tools = require('./lib/tools');
var redis = require("redis");
// var mongoose = require('mongoose');
var _ = require("underscore");
var $ = require("jquery");

/** 
 * Objects
 */

// create redis client
var client = redis.createClient();

// create restify server to server http api
var server = restify.createServer();
server.use(restify.bodyParser());

// create restify json client for api requests
var wikipedia = restify.createJsonClient({
  url: 'http://'+config.creds.lang+'.wikipedia.org',
  version: '*'
});

/** 
 * Run
 */

// start api requests with given keyword
// wikiSearch('database');

/** 
 * Helper functions
 */

/** 
 * function wikiSearch will start the main processes to search for the best wikipedia page for the given string
 *
 * @param string term
 * @return boolean
 */
function wikiSearch(term) {
  // do api call
  wikipedia.get('/w/api.php?action=opensearch&search='+escape(term)+'&format=json&limit=3', function(err, req, res, data) {

    if(typeof data[1] == 'undefined' || typeof data[1][0] == 'undefined') {
      if(config.creds.debug)
        console.log('No page found in wikipedia for '+req.path);
      client.srem('____sites2do____',term);
      goToNext();
      return;
    }

    // get first matching result
    var firstTitle = data[1][0];

    // set first result as done
    client.sadd('____sites____', firstTitle, function (err, result) {
      if(result) {
        wikiGrab(firstTitle);
        client.srem('____sites2do____',firstTitle);
      }
      else {
        if(config.creds.debug)
          console.log(firstTitle+' was crawled already!');
        goToNext();
        return false;
      }
    });

    // add all sites to queue
    for (var i = data[1].length - 1; i >= 0; i--) {
      client.sadd('____sites2do____',data[1][i]);
    }

  });
}

/** 
 * function wikiGrab will get the content for the given wikipedia page title
 *
 * @param string title
 * @return boolean
 */
function wikiGrab(title) {
  // do the api call
  wikipedia.get('/w/api.php?rvprop=content&format=json&prop=revisions|categories&rvprop=content&action=query&titles='+escape(title), function(err, req, res, data) {
    if(typeof data.query == 'undefined') {
      goToNext();
      return false;
    }

    // check if valid content
    if(typeof data.query.pages[Object.keys(data.query.pages)[0]].revisions == 'undefined') {
      goToNext();
      return false;
    }

    // get the main content of the wikipedia page
    var rawtext = data.query.pages[Object.keys(data.query.pages)[0]].revisions[0]["*"];
     // now split the whole content into text blocks
    var parts = rawtext.split(/\n|\r/);
    var snippets = [];

    if(config.creds.debug)
      console.log('going to http://'+config.creds.lang+'.wikipedia.org/wiki/'+title);

    // loop all text blocks and pull these with more than config.creds.min_text_block_length (default: 120) chars
    for (var i = parts.length - 1; i >= 0; i--) {
      if(parts[i].length > config.creds.min_text_block_length) {
        snippets.push(parts[i]);
      }
    }

    if(snippets.length > 0) {
      // give the loop worker something to do
      loopWorker(snippets);
    }
    else {
      // restart fetch
      goToNext();
    }

  });
}

/** 
 * function loopWorker will process all snippets gently for your system
 *
 * @param array snippets
 * @return
 */
function loopWorker(snippets) {
  // when snippetbox is empty, restart fetch
  if(snippets.length === 0) {
    if(config.creds.debug)
      console.log('Count of snippets: '+snippets.length);
    goToNext();
    return;
  }

  // analyze full text block
  $.when(analyzeText(snippets.pop(),snippets.length)).done(function() {
    // set a timeout to be gently to the memory and cpu 
    // (can be changed in the config file)
    var t=setTimeout(function(){loopWorker(snippets);},config.creds.sleeptime);
  });
}

/** 
 * function goToNext will move on to a random element to search for in the queue ____sites2do____ which is stored in redis
 *
 * @param
 * @return
 */
function goToNext() {
  if(config.creds.debug)
    console.log('NEXT');
  client.smembers('____sites2do____', function (err, result) {
    var randomnr=Math.floor(Math.random()*result.length);
    wikiSearch(result[randomnr]);
  });
}

/** 
 * function analyzeText will get the content for the given wikipedia page title
 *
 * @param string title
 * @return boolean
 */
function analyzeText(snippet,counter) {

  // split the text block to words
  var words = tools.tokenize(snippet);

  if(config.creds.debug)
      console.log('Count of words in snippet ('+counter+'): '+words.length);

  // create empty object
  var obj = {};

  var multi = client.multi();

  // loop all words
  for (var i = words.length - 1; i >= 0; i--) {

    // count all seen words
    if(typeof obj[words[i].toLowerCase()] == 'undefined')
      obj[words[i].toLowerCase()] = 1;
    else
      obj[words[i].toLowerCase()]++;

    // add every word to the queue to spread the scrape
    multi.sadd('____sites2do____',words[i].toLowerCase());

    // if(config.creds.debug)
    //   console.log(words[i].toLowerCase()+'¥ - '+words[j].toLowerCase()+' - '+similar_text(words[i].toLowerCase(),words[j].toLowerCase(),1));
  }

  var base;

  $.each(obj, function(index, value) {

    // skip if not valid
    if(typeof index == 'undefined' || typeof index.toLowerCase == 'undefined')
      return;

    // create new obj from class Base, make sure to work with lowercase only
    base = new Base(index.toLowerCase());

    // loop all words
    $.each(obj, function(index2, value2) {
      if(index != index2) {
        // add relation, value2 is the counter of how often the word was seen in the recent textblock
        base.pushRelation(index2.toLowerCase(),value2);
      }
    });

    base.save();

    // add to our general 'ALL' collection, to identify the most used words of all
    multi.sadd('____all____', index.toLowerCase()); // add keyword
    multi.incrby('____all____'+':'+index.toLowerCase(), value); // track its density

  });

  multi.exec(function(err, replies) {
      return true;
  });
}

/** 
 * function inAButNotInB will remove all items from array a which are in array b
 * depending on underscore.js
 *
 * @param
 * @return
 */
function inAButNotInB(A, B) {
  return _.filter(A, function (d) {
    return !_.contains(B, d);
  });
}

/** 
 * class Base will get handle database-actions related to one keyword
 *
 * @param string val
 * @return boolean
 */
function Base(val) {

  // Store variables
  var that = this,
      multi_in = client.multi(), // to pipeline actions for redis
      res;

  // to set the restify response, a bit hacky actually
  this.setRes = function(val) {
    res = val;
  };

  // process the pipelined actions in redis
  this.save = function() {
    multi_in.exec();
  };

  // get all relationes, without the noise
  this.getTopRelations = function() {
    // get most often used keywords (limit 500)
    client.smembers('____all____', function (err1, items1) {
      console.log(items1);
      return;
        // get most often realted keywords for the given keyword
        client.sort(val, "by", val+":*", 'LIMIT', 0, 120, 'DESC', "get", "#", function (err2, items2) {
          // remove the noise by removing the most often used keywords
          doResponse(inAButNotInB(items2,items1),res);
        });
    });
  };

  // add word and count up
  this.pushRelation = function(rel, incr) {
    multi_in.sadd(val, rel);
    if(typeof incr == 'undefined') {
      incr = 1;
    }
    multi_in.incrby(val+':'+rel, incr);
  };
}

/** 
 * function doResponse will send the response to the client
 *
 * @param string data
 * @return res
 */
function doResponse(data, res) {
  res.send(data);
}

/** 
 * function getRelations will take action as a router function to deliver all relations to the requested keyword
 *
 * @param string req.params.name
 * @return boolean
 */
function getRelations(req, res, next) {
  var base = new Base(req.params.name);
  base.setRes(res);
  base.getTopRelations();
}

/** 
 * Routes
 */

// Set up our routes
server.get('/relations/:name', getRelations);

/** 
 * Server
 */

// start the server
server.listen(config.creds.server_port, function() {
  console.log('%s listening at %s', server.name, server.url);
});