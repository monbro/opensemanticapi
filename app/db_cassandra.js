/*
 * This file is not working jet
 */

var Tools = require('../lib/tools');
var config = require('../config.js');
// var cassandra = require("cassandra");

/* Used variables names
 * ____sites____ = wikipedia page titles which were scraped already
 * ____sites2do____ = wikipedia page titles which are queued to scrape
 * ____all____ = a collection of all ever seen words with a increment number
 */

var Db = function() {
    // create redis client
    tools = Tools;
    that = this;
    client = redis.createClient();
    isMulti = false;
};

Db.prototype.enableMulti = function() {
    multi = client.multi();
    isMulti = true;
};

Db.prototype.disableMulti = function() {
    multi = null;
    isMulti = false;
};

Db.prototype.addPageToQueue = function(s) {
    if(config.creds.debug) {
        console.log('addPageToQueue "'+s+'"');
    }
    if(isMulti) {
        multi.sadd('____sites2do____',s);
    }
    else {
        client.sadd('<',s);
    }
};

Db.prototype.removePageFromQueue = function(s) {
    client.srem('____sites2do____',s);
};

Db.prototype.getRandomItemFromQueue = function(callback) {
    client.srandmember('____sites2do____', function (err, result) {
        return callback(result);
    });
};

Db.prototype.addPageAsDone = function(s, callback) {
    client.sadd('____sites____', s, callback);
};

Db.prototype.removePageAsDone = function(s, callback) {
    client.srem('____sites____', s, callback);
};

Db.prototype.addRelation = function(owner,relation,i) {
    if(isMulti) {
        multi.sadd(owner, relation);
        if(typeof i == 'undefined') {
          i = 1;
        }
        multi.incrby(owner+':'+relation, i);
    }
    else {
        client.sadd(owner, relation);
        if(typeof i == 'undefined') {
          i = 1;
        }
        client.incrby(owner+':'+relation, i);
    }
};

Db.prototype.addToGlobalCounter = function(owner,s) {
    if(isMulti) {
        // add to our general 'ALL' collection, to identify the most used words of all
        multi.sadd('____all____', s); // add keyword
        multi.incrby('____all____'+':'+s, owner); // track its density
    }
    else {
        client.sadd('____all____', s); // add keyword
        client.incrby('<'+':'+s, owner); // track its density
    }
};

Db.prototype.getTopRelations = function(owner, callback, res) {
    client.sort('____all____', "by", "____all____:*", 'LIMIT', 0, 500, 'DESC', "get", "#", function (err1, items1) {
        // get most often realted keywords for the given keyword
        client.sort(owner, "by", owner+":*", 'LIMIT', 0, 120, 'DESC', "get", "#", function (err2, items2) {
          // remove the noise by removing the most often used keywords
          callback(tools.inAButNotInB(items2,items1),res);
        });
    });
};

Db.prototype.flush = function(callback) {
    if(false === isMulti || multi === null) {
        console.log('Error - you must use enableMulti() before flush().');
        return;
    }
    callback = callback || null;
    multi.exec(callback);
    // that.disableMulti();
    multi = null;
    isMulti = false;
};

module.exports = Db;