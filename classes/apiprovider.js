module.exports = function(client) {
  // var that = this;

  return {
    /** 
     * function inAButNotInB will remove all items from array a which are in array b
     * depending on underscore.js
     *
     * @param
     * @return
     */
    inAButNotInB: function (A, B) {
      return _.filter(A, function (d) {
        return !_.contains(B, d);
      });
    },

    Base: Base,

    /** 
     * function doResponse will send the response to the client
     *
     * @param string data
     * @return res
     */
    doResponse: function (data, res) {
      res.send(data);
    },

    /** 
     * function getRelations will take action as a router function to deliver all relations to the requested keyword
     *
     * @param string req.params.name
     * @return boolean
     */
    getRelations: function (req, res, next) {
      var base = new Base(req.params.name,client);
      base.setRes(res);
      base.getTopRelations();
    }
  }
};

/** 
 * class Base will get handle database-actions related to one keyword
 *
 * @param string val
 * @return boolean
 */
Base = function (val,client) {
  // Store variables
  var that = this,
      multi_in = client.multi(), // to pipeline actions for redis
      res;

  // to set the restify response, a bit hacky actually
  this.setRes = function(val) {
    res = val;
  };

  // process the pipelined actions in redis
  this.save = function() {
    multi_in.exec();
  };

  // get all relationes, without the noise
  this.getTopRelations = function() {
    // get most often used keywords (limit 500)
    client.smembers('____all____', function (err1, items1) {
      console.log(items1);
      return;
        // get most often realted keywords for the given keyword
        client.sort(val, "by", val+":*", 'LIMIT', 0, 120, 'DESC', "get", "#", function (err2, items2) {
          // remove the noise by removing the most often used keywords
          doResponse(inAButNotInB(items2,items1),res);
        });
    });
  };

  // add word and count up
  this.pushRelation = function(rel, incr) {
    multi_in.sadd(val, rel);
    if(typeof incr == 'undefined') {
      incr = 1;
    }
    multi_in.incrby(val+':'+rel, incr);
  };
};