'use strict';

var require = require || {};
var module = module || {};
var console = console || {};

var restify = require('restify');
var express = require('express');
var config = require('../config');
var Db = require('./db');

var server, db, that;

var Http = {

    init: function() {
        server = restify.createServer();
        server.use(restify.bodyParser());
        db = new Db();
        db.init();
        that = this;

        // initialise routes
        that.initRoutes();

        // boot server
        that.boot();
    },

    initRoutes: function() {
        if(config.creds.debug) {
            console.log('initRoutes');
        }
        // Set up our routes
        server.get('/relations/:name', that.responseRelations);
    },

    boot: function() {
        if(config.creds.debug) {
            console.log('start server');
        }
        // start the server
        server.listen(config.creds.server_port, function() {
          console.log('%s listening at %s', server.name, server.url);
        });
    },

    responseRelations: function(req, res, next) {
        if(config.creds.debug) {
            console.log('responseRelations for "'+req.params.name+'"');
        }
        console.log('Will deliver top relations for requested word "'+req.params.name+'".');
        db.getTopRelations(req.params.name, that.doResponse, res);
    },

    doResponse: function(data, res) {
        if(config.creds.debug) {
            console.log('doResponse');
        }
        res.send(data);
    }
    
};

module.exports = Http;