
/**
 * This class will scrape wikipedia articles and build out of it a datamase which can be searched in a semantic way.
 * The density count of keywords in a small local place (textblock) allows us to detect related keywords in a semantic way
 *
 * @author Michael Klein <klein@monbro.de>
 * @url http://open-semantic.com/
 * @package opensemanticapi
 * @version 0.1
 */

/** 
 * laod config
 */
var config = require('./config');

/** 
 * Basic Objects
 */

// our basic app object
var App = function() {};

// our basic app
var app = new App();

var Model = require('./app/model');

App.prototype.getModel = function(s) {
  return new Model(s); 
};

// var test = app.getModel('test');
// console.log(test.getValue());

if(!config.creds.http_server) {
    var Scraper = require("./app/scraping");
    var scraper = new Scraper();

    // Start Cronjob
    scraper.wikiSearch('database');
}

/** 
 * Server
 */

// Start HTTP API RESTFUL Server
if(config.creds.http_server) {
    var Http = require("./app/http");
    var http = new Http(); 
}
