var restify = require('restify');
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


function getTopRelations() {
  // SORT items-set by items:* DESC
}



function getRelations(req, res, next) {

  client.set(req.params.name, "string val2", redis.print);
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

  client.get(req.params.name, function (err, result2) {
      res.send(result2);
  });

  client.quit();
}




// Set up our routes and start the server
server.get('/keyword/:name', getRelations);

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});