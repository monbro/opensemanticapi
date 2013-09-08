var Model = function(s) { 
  val = s || null;
};

Model.prototype.getValue = function() { 
  return val; 
};

Model.prototype.setValue = function(s) { 
  val = s; 
};

module.exports = Model;