module.exports = function(client) {

  return {
    /** 
     * function analyzeText will get the content for the given wikipedia page title
     *
     * @param string title
     * @return boolean
     */
    analyzeText: function (snippet,counter) {
      // split the text block to words
      var words = tools.tokenize(snippet);

      if(config.creds.debug)
          console.log('Count of words in snippet ('+counter+'): '+words.length);

      // create empty object
      var obj = {};

      var multi = client.multi();

      // loop all words
      for (var i = words.length - 1; i >= 0; i--) {

        // count all seen words
        if(typeof obj[words[i].toLowerCase()] == 'undefined')
          obj[words[i].toLowerCase()] = 1;
        else
          obj[words[i].toLowerCase()]++;

        // add every word to the queue to spread the scrape
        multi.sadd('____sites2do____',words[i].toLowerCase());

        // if(config.creds.debug)
        //   console.log(words[i].toLowerCase()+'¥ - '+words[j].toLowerCase()+' - '+similar_text(words[i].toLowerCase(),words[j].toLowerCase(),1));
      }

      var base;

      $.each(obj, function(index, value) {

        // skip if not valid
        if(typeof index == 'undefined' || typeof index.toLowerCase == 'undefined')
          return;

        // create new obj from class Base, make sure to work with lowercase only
        base = new Base(index.toLowerCase());

        // loop all words
        $.each(obj, function(index2, value2) {
          if(index != index2) {
            // add relation, value2 is the counter of how often the word was seen in the recent textblock
            base.pushRelation(index2.toLowerCase(),value2);
          }
        });

        base.save();

        // add to our general 'ALL' collection, to identify the most used words of all
        multi.sadd('____all____', index.toLowerCase()); // add keyword
        multi.incrby('____all____'+':'+index.toLowerCase(), value); // track its density

      });

      multi.exec(function(err, replies) {
          return true;
      });
    }
  }
};