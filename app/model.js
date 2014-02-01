'use strict';

var require = require || {};
var module = module || {};
var console = console || {};

var val;

var Model = {

    init: function(s) {
        val = s || null;
    },

    getValue: function() {
      return val;
    },

    setValue: function(s) {
      val = s;
    }
  
};

module.exports = Model;