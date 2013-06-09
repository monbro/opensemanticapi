var restify = require('restify');
var express = require('express');
var config = require('./config.js');
// var mongoose = require('mongoose');

var redis = require("redis");
var _ = require("underscore");
var $ = require("jquery");
var client = redis.createClient();

// client.set("string key", "string val", redis.print);
// client.hset("hash key", "hashtest 1", "some value", redis.print);
// client.hset(["hash key", "hashtest 2", "some other value"], redis.print);
// client.hkeys("hash key", function (err, replies) {
//   console.log(replies.length + " replies:");
//   replies.forEach(function (reply, i) {
//     console.log("    " + i + ": " + reply);
//   });
//   client.quit();
// });

var server = restify.createServer();
server.use(restify.bodyParser());

var wikipedia = restify.createJsonClient({
  url: 'http://de.wikipedia.org',
  version: '*'
});

// db = mongoose.connect(config.creds.mongoose_auth_local),
// Schema = mongoose.Schema;

// // Create a schema for our data
// var WordSchema = new Schema({
//   name: String,
//   count: Number
// });
// // Use the schema to register a model with MongoDb
// mongoose.model('Word', WordSchema);
// var Word = mongoose.model('Word');

// Try do a request cronjob preparation
function wikiSearch(term) {
  wikipedia.get('/w/api.php?action=opensearch&search='+term+'&format=json&limit=10', function(err, req, res, data) {
    var firstTitle = data[1][0];
    wikiGrab(firstTitle);
  });
}

function wikiGrab(title) {
  wikipedia.get('/w/api.php?rvprop=content&format=json&prop=revisions|categories&rvprop=content&action=query&titles='+title, function(err, req, res, data) {
    var rawtext = data.query.pages[Object.keys(data.query.pages)[0]].revisions[0]["*"];
    var parts = rawtext.split(/\n|\r/);
    var snippets = [];

    for (var i = parts.length - 1; i >= 0; i--) {
      if(parts[i].length > 100) {
        snippets.push(parts[i]);
        analyzeText(parts[i]);
        return;
      }
    }
    console.log('Count of snippets: '+snippets.length);
  });
}

function analyzeText(snippet) {
   console.log(tokenize(snippet));
}

wikiSearch('michael');

function tokenize(str) {
 
   var punct='\\['+ '\\!'+ '\\"'+ '\\#'+ '\\$'+              // since javascript does not
             '\\%'+ '\\&'+ '\\\''+ '\\('+ '\\)'+             // support POSIX character
             '\\*'+ '\\+'+ '\\,'+ '\\\\'+ '\\-'+             // classes, we'll need our
             '\\.'+ '\\/'+ '\\:'+ '\\;'+ '\\<'+              // own version of [:punct:]
             '\\='+ '\\>'+ '\\?'+ '\\@'+ '\\['+
             '\\]'+ '\\^'+ '\\_'+ '\\`'+ '\\{'+
             '\\|'+ '\\}'+ '\\~'+ '\\]',
 
       re=new RegExp(                                        // tokenizer
          '\\s*'+            // discard possible leading whitespace
          '('+               // start capture group #1
            '\\.{3}'+            // ellipsis (must appear before punct)
          '|'+               // alternator
            '\\s+\\-\\s+'+       // hyphenated words (must appear before punct)
          '|'+               // alternator
            '\\s+\'(?:\\s+)?'+   // compound words (must appear before punct)
          '|'+               // alternator
            '\\s+'+              // other words
          '|'+               // alternator
            '['+punct+']'+        // punct
          ')'                // end capture group
        );
 
   // grep(ary[,filt]) - filters an array
   //   note: could use jQuery.grep() instead
   // @param {Array}    ary    array of members to filter
   // @param {Function} filt   function to test truthiness of member,
   //   if omitted, "function(member){ if(member) return member; }" is assumed
   // @returns {Array}  all members of ary where result of filter is truthy
 
   function grep(ary,filt) {
     var result=[];
     for(var i=0,len=ary.length;i++<len;) {
       var member=ary[i]||'';
       if(filt && (typeof filt === 'Function') ? filt(member) : member) {
         result.push(member);
       }
     }
     return result;
   }
 
   return grep( str.split(re) );   // note: filter function omitted 
                                   //       since all we need to test 
                                   //       for is truthiness
} // end tokenize()

// Base Class
///////////////////////////////////////////////////////
function Base(val) {

  // Store variables
  var that = this,
      res;

  this.setRes = function(val) {
    res = val;
  };

  // Public functions
  this.getTopRelations = function() {
    // SORT items-set by items:* DESC


    var all_users = [];
    // Get all the users for this page.

    client.sort(val, "by", val+":*", 'DESC', "get", "#", function (err, items) {
      // client.get(val+':'+items[0],function (err, item) {
      //   console.log(item);
      // });
      // console.log(items);
      doResponse(items,res);
    });

  //   client.smembers(val, function (err, items ) {
  //     // Now get the name of each of those users.
  //     // console.log(items);

  //     for (var i = 0; i < items.length; i++) {
  //       console.log(items[i]);
  //     }


  //     // for (var i = 0; i < user_ids.length; i++) {
  //     //  client.get(val + user_ids[i], function(err, count) {
  //     //    var myobj = {};
  //     //    myobj[user_ids[i]] = count;
  //     //    all_users.push(myobj);
  //     //       if (i === (user_ids.length - 1)) {
  //     //          // console.log(all_users);
  //     //          doResponse(all_users,res);
  //     //       }
  //     //   });
  //     // }
  //   });

  };

  // add word and count up
  this.pushRelation = function(rel) {
    client.sadd(val, rel);
    // starts with 1 if not set
    client.incr(val+':'+rel);

    if(rel == 'eins') {
      client.incr(val+':'+rel);
    }
  };

  this.setTestData = function() {
    that.pushRelation('eins');
    that.pushRelation('zwo');
    that.pushRelation('dree');

    client.get(val+':eins', function (err, result3) {
      console.log(result3);
      doResponse(result3,res);
    });
  };

}

function doResponse(data, res) {
  res.send(data);
}

function getRelations(req, res, next) {

  // client.set(req.params.name, "string val2", redis.print);
  // client.incr(req.params.name+"_counter", "string val2", redis.print);

  // var message = new Word();
  // message.name = req.params.name;
  // message.count = 0;
  // message.save(function () {
  //   // res.send(req.body);
  //   console.log(req.body);
  // });

  // res.send(true);


  // Resitify currently has a bug which doesn't allow you to set default headers
  // This headers comply with CORS and allow us to server our response to any origin
  // res.header("Access-Control-Allow-Origin", "http://www.yourdomain.com");
  // res.header("Access-Control-Allow-Headers", "X-Requested-With");
  // .find() without any arguments, will return all results
  // the `-1` in .sort() means descending order
  // Word.find({}).execFind(function (arr,data) {
  //   res.send(data);
  // });
 //  var output;
 // output = client.get(req.params.name);
 // console.log(output);
 // console.log(client.get(req.params.name));

// how has using: http://stackoverflow.com/questions/5825485/how-to-get-count-of-values-in-redis-hash

// our pratice
// http://stackoverflow.com/questions/5118807/atomically-remove-an-item-from-set-if-a-counter-in-another-key-is-below-zero

// list all
// SMEMBERS items-set
// get items:fooo

//add one 
// SADD "items-set" "fooo"

// count up
// INCR "items:foo0"

  // client.get(req.params.name, function (err, result2) {
  //     // res.send(result2);

  // });

  var base = new Base(req.params.name);
  base.setRes(res);
  base.getTopRelations();
  // client.quit();
}

function setTestData(req, res, next) {
  var base = new Base(req.params.name);
  base.setRes(res);
  base.setTestData();
  // client.quit();
}

// Set up our routes and start the server
server.get('/relations/:name', getRelations);
server.get('/settestdata/:name', setTestData);

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});