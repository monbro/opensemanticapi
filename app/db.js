'use strict';

var require = require || {};
var module = module || {};
var console = console || {};

var config = require('../config.js');

// choose only one of the database ports
var DbPort = require("./db_redis");
// var db_port = require("./db_cassandra");
// var db_port = require("./db_hbase");

var that, dbPort;

var Db = {

    init: function() {
        that = this;
        dbPort = DbPort;
        dbPort.init();
    },

    enableMulti: function() {
        dbPort.enableMulti();
    },

    disableMulti: function() {
        dbPort.disableMulti();
    },

    addPageToQueue: function(s) {
        dbPort.addPageToQueue(s);
    },

    removePageFromQueue: function(s) {
        dbPort.removePageFromQueue(s);
    },

    getRandomItemFromQueue: function(callback) {
        dbPort.getRandomItemFromQueue(callback);
    },

    addPageAsDone: function(s, callback) {
        dbPort.addPageAsDone(s, callback);
    },

    removePageAsDone: function(s, callback) {
        dbPort.removePageAsDone(s, callback);
    },

    addRelation: function(owner,relation,i) {
        dbPort.addRelation(owner,relation,i);
    },
    
    addToGlobalCounter: function(owner,s) {
        dbPort.addToGlobalCounter(owner,s);
    },


    getTopRelations: function(owner, callback, res) {
        dbPort.getTopRelations(owner, callback, res);
    },

    flush: function(callback) {
        dbPort.flush(callback);
    }

};

module.exports = Db;