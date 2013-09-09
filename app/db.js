var config = require('../config.js');

// choose only one of the database ports
var Db_port = require("./db_redis");
// var db_port = require("./db_cassandra");
// var db_port = require("./db_hbase");

var Db = function() {
    that = this;
    db_port = new Db_port();
};

Db.prototype.enableMulti = function() {
    db_port.enableMulti();
};

Db.prototype.disableMulti = function() {
    db_port.disableMulti();
};

Db.prototype.addPageToQueue = function(s) {
    db_port.addPageToQueue(s);
};

Db.prototype.removePageFromQueue = function(s) {
    db_port.removePageFromQueue(s);
};

Db.prototype.getRandomItemFromQueue = function(callback) {
    db_port.getRandomItemFromQueue(callback);
};

Db.prototype.addPageAsDone = function(s, callback) {
    db_port.addPageAsDone(s, callback);
};

Db.prototype.removePageAsDone = function(s, callback) {
    db_port.removePageAsDone(s, callback);
};

Db.prototype.addRelation = function(owner,relation,i) {
    db_port.addRelation(owner,relation,i);
};

Db.prototype.addToGlobalCounter = function(owner,s) {
    db_port.addToGlobalCounter(owner,s);
};

Db.prototype.getTopRelations = function(owner, callback, res) {
    db_port.getTopRelations(owner, callback, res);
};

Db.prototype.flush = function(callback) {
    db_port.flush(callback);
};

module.exports = Db;