
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
 * thrid part modules
 */
var restify = require('restify');
var express = require('express');
var config = require('./config');
var tools = require('./lib/tools');
var redis = require("redis");
// var mongoose = require('mongoose');
var _ = require("underscore");
var $ = require("jquery");

/** 
 * Basic Objects
 */

// create redis client
var client = redis.createClient();

/** 
 * our classes
 */
var text = require("./classes/textanalyze")(client);
var wiki = require("./classes/wiki")(client);
var apiprovider = require("./classes/apiprovider")(client);

/** 
 * Objects
 */



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
// wikiSearch('database'); // database can be replaced with a random name to start with

/** 
 * Routes
 */

// Set up our routes
server.get('/relations/:name', apiprovider.getRelations);

/** 
 * Server
 */

// start the server
server.listen(config.creds.server_port, function() {
  console.log('%s listening at %s', server.name, server.url);
});