var restify = require('restify');
var express = require('express');
var config = require('./config.js');
var tools = require('./lib/tools');
// var mongoose = require('mongoose');

var redis = require("redis");
var _ = require("underscore");
var $ = require("jquery");
var client = redis.createClient();
var multi;
// var stream = client.stream(); 

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
  wikipedia.get('/w/api.php?action=opensearch&search='+escape(term)+'&format=json&limit=3', function(err, req, res, data) {

    // console.log(err);
    // console.log(data);

    if(typeof data[1] == 'undefined' || typeof data[1][0] == 'undefined') {
      console.log('No page found in wikipedia for '+req.path);
      client.srem('____sites2do____',term);
      goToNext();
      return;
    }

    var firstTitle = data[1][0];

    client.sadd('____sites____', firstTitle, function (err, result) {
      if(result) {
        wikiGrab(firstTitle);
        client.srem('____sites2do____',firstTitle);
      }
      else {
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

function wikiGrab(title) {
  wikipedia.get('/w/api.php?rvprop=content&format=json&prop=revisions|categories&rvprop=content&action=query&titles='+escape(title), function(err, req, res, data) {
    if(typeof data.query == 'undefined') {
      goToNext();
      return false;
    }

    if(typeof data.query.pages[Object.keys(data.query.pages)[0]].revisions == 'undefined') {
      goToNext();
      return false;
    }

    var rawtext = data.query.pages[Object.keys(data.query.pages)[0]].revisions[0]["*"];
    var parts = rawtext.split(/\n|\r/);
    var snippets = [];

    console.log('going to http://de.wikipedia.org/wiki/'+title);

    for (var i = parts.length - 1; i >= 0; i--) {
      if(parts[i].length > 120) {
        snippets.push(parts[i]);

        // analyze full text block
        analyzeText(parts[i]);
      }
      if(i === 0) {
        goToNext();
      }
    }
    console.log('Count of snippets: '+snippets.length);
  });
}

function goToNext() {
  console.log('NEXT');
  client.srandmember('____sites2do____', function (err, result) {
    wikiSearch(result);
  });
}

function analyzeText(snippet) {
  var words = tools.tokenize(snippet);
  var obj = {};

  multi = client.multi();

  for (var i = words.length - 1; i >= 0; i--) {

    if(typeof obj[words[i]] == 'undefined')
      obj[words[i]] = 1;
    else
      obj[words[i]]++;

    multi.sadd('____sites2do____',words[i]);

    // console.log(words[i].toLowerCase()+'¥ - '+words[j].toLowerCase()+' - '+similar_text(words[i].toLowerCase(),words[j].toLowerCase(),1));
  }

  // console.log(obj);

  $.each(obj, function(index, value) {
    // console.log(index + ': ' + value);

    if(typeof index == 'undefined')
      return; // skip to next

    base = new Base(index.toLowerCase());
    $.each(obj, function(index2, value2) {
      if(index != index2) {
        base.pushRelation(index2.toLowerCase(),value2);
      }
    });
    base.save();

    // add to our general 'ALL' collection, to identify the most used words of all
    multi.sadd('____all____', index.toLowerCase());
    multi.incrby('____all____'+':'+index.toLowerCase(), value);

//     client.multi()
// .hmset(randKey, {"author": params.author,
// "quote": params.quote})
// .sadd('Author:' + params.author, randKey)

// .exec(function (err, replies) {
// if (err) { throw err; };
// if (replies[0] == "OK") { console.log('Added...\n'); }
// });

  });

  multi.exec();

}

wikiSearch('datenbank');

// 2do:
// remove bindewürter und wir ihr sie etc.
// crawl all wikipedia links upcoming in this article

function inAButNotInB(A, B) {
  return _.filter(A, function (d) {
    return !_.contains(B, d);
  });
}

// Base Class
///////////////////////////////////////////////////////
function Base(val) {

  // Store variables
  var that = this,
      multi_in = client.multi(),
      res;

  this.setRes = function(val) {
    res = val;
  };

  this.save = function() {
    multi_in.exec();
  };

  // Public functions
  this.getTopRelations = function() {
    // SORT items-set by items:* DESC

    var all_users = [];
    // Get all the users for this page.

     client.sort('____all____', "by", "____all____:*", 'LIMIT', 0, 500, 'DESC', "get", "#", function (err1, items1) {
      // client.get(val+':'+items[0],function (err, item) {
      //   console.log(item);
      // });
      // console.log(items);

          client.sort(val, "by", val+":*", 'LIMIT', 0, 120, 'DESC', "get", "#", function (err2, items2) {
            // client.get(val+':'+items[0],function (err, item) {
            //   console.log(item);
            // });
            // console.log(items);

            doResponse(inAButNotInB(items2,items1),res);
          });


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
  this.pushRelation = function(rel, incr) {
    multi_in.sadd(val, rel);

    if(typeof incr == 'undefined') {
      incr = 1;
    }
    multi_in.incrby(val+':'+rel, incr);

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