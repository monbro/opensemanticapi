module.exports = function(client) {
  return {
    /** 
     * function wikiSearch will start the main processes to search for the best wikipedia page for the given string
     *
     * @param string term
     * @return boolean
     */
    wikiSearch: function (term) {
      // do api call
      wikipedia.get('/w/api.php?action=opensearch&search='+escape(term)+'&format=json&limit=3', function(err, req, res, data) {

        if(typeof data[1] == 'undefined' || typeof data[1][0] == 'undefined') {
          if(config.creds.debug)
            console.log('No page found in wikipedia for '+req.path);
          client.srem('____sites2do____',term);
          goToNext();
          return;
        }

        // get first matching result
        var firstTitle = data[1][0];

        // set first result as done
        client.sadd('____sites____', firstTitle, function (err, result) {
          if(result) {
            wikiGrab(firstTitle);
            client.srem('____sites2do____',firstTitle);
          }
          else {
            if(config.creds.debug)
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
    },

    /** 
     * function wikiGrab will get the content for the given wikipedia page title
     *
     * @param string title
     * @return boolean
     */
    wikiGrab: function (title) {
      // do the api call
      wikipedia.get('/w/api.php?rvprop=content&format=json&prop=revisions|categories&rvprop=content&action=query&titles='+escape(title), function(err, req, res, data) {
        if(typeof data.query == 'undefined') {
          goToNext();
          return false;
        }

        // check if valid content
        if(typeof data.query.pages[Object.keys(data.query.pages)[0]].revisions == 'undefined') {
          goToNext();
          return false;
        }

        // get the main content of the wikipedia page
        var rawtext = data.query.pages[Object.keys(data.query.pages)[0]].revisions[0]["*"];
         // now split the whole content into text blocks
        var parts = rawtext.split(/\n|\r/);
        var snippets = [];

        if(config.creds.debug)
          console.log('going to http://'+config.creds.lang+'.wikipedia.org/wiki/'+title);

        // loop all text blocks and pull these with more than config.creds.min_text_block_length (default: 120) chars
        for (var i = parts.length - 1; i >= 0; i--) {
          if(parts[i].length > config.creds.min_text_block_length) {
            snippets.push(parts[i]);
          }
        }

        if(snippets.length > 0) {
          // give the loop worker something to do
          loopWorker(snippets);
        }
        else {
          // restart fetch
          goToNext();
        }

      });
    },

    /** 
     * function loopWorker will process all snippets gently for your system
     *
     * @param array snippets
     * @return
     */
    loopWorker: function (snippets) {
      // when snippetbox is empty, restart fetch
      if(snippets.length === 0) {
        if(config.creds.debug)
          console.log('Count of snippets: '+snippets.length);
        goToNext();
        return;
      }

      // analyze full text block
      $.when(text.analyzeText(snippets.pop(),snippets.length)).done(function() {
        // set a timeout to be gently to the memory and cpu 
        // (can be changed in the config file)
        var t=setTimeout(function(){loopWorker(snippets);},config.creds.sleeptime);
      });
    },

    /** 
     * function goToNext will move on to a random element to search for in the queue ____sites2do____ which is stored in redis
     *
     * @param
     * @return
     */
    goToNext: function () {
      if(config.creds.debug)
        console.log('NEXT');
      client.smembers('____sites2do____', function (err, result) {
        var randomnr=Math.floor(Math.random()*result.length);
        wikiSearch(result[randomnr]);
      });
    }
  }
};