var restify = require('restify');
var express = require('express');
var Db = require('./db');
var config = require('../config');

var Http = function() {
    server = restify.createServer();
    server.use(restify.bodyParser());
    db = new Db();
    that = this;

    // initialise routes
    that.initRoutes();
    that.init();
};

Http.prototype.initRoutes = function() {
    if(config.creds.debug) {
        console.log('initRoutes');
    }
    // Set up our routes
    server.get('/relations/:name', that.responseRelations);
};

Http.prototype.init = function() {
    if(config.creds.debug) {
        console.log('start server');
    }
    // start the server
    server.listen(config.creds.server_port, function() {
      console.log('%s listening at %s', server.name, server.url);
    });
};

Http.prototype.responseRelations = function(req, res, next) {
    if(config.creds.debug) {
        console.log('responseRelations for "'+req.params.name+'"');
    }
    console.log('Will deliver top relations for requested word "'+req.params.name+'".');
    db.getTopRelations(req.params.name, that.doResponse, res);
};

Http.prototype.doResponse = function(data, res) {
    if(config.creds.debug) {
        console.log('doResponse');
    }
    res.send(data);
};

module.exports = Http;