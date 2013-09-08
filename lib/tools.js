var _ = require("underscore");

module.exports = { 
  inAButNotInB: function (A, B) {
    return _.filter(A, function (d) {
      return !_.contains(B, d);
    });
  },
  similar_text: function (first, second, percent) {
    // http://kevin.vanzonneveld.net
  // +   original by: Rafał Kukawski (http://blog.kukawski.pl)
  // +   bugfixed by: Chris McMacken
  // +   added percent parameter by: Markus Padourek (taken from http://www.kevinhq.com/2012/06/php-similartext-function-in-javascript_16.html)
  // *     example 1: similar_text('Hello World!', 'Hello phpjs!');
  // *     returns 1: 7
  // *     example 2: similar_text('Hello World!', null);
  // *     returns 2: 0
  // *     example 3: similar_text('Hello World!', null, 1);
  // *     returns 3: 58.33
  if (first === null || second === null || typeof first === 'undefined' || typeof second === 'undefined') {
    return 0;
  }

  first += '';
  second += '';

  var pos1 = 0,
  pos2 = 0,
  max = 0,
  firstLength = first.length,
  secondLength = second.length,
  p, q, l, sum;

  max = 0;

  for (p = 0; p < firstLength; p++) {
    for (q = 0; q < secondLength; q++) {
      for (l = 0;
        (p + l < firstLength) && (q + l < secondLength) && (first.charAt(p + l) === second.charAt(q + l)); l++);
        if (l > max) {
          max = l;
          pos1 = p;
          pos2 = q;
        }
      }
    }

    sum = max;

    if (sum) {
      if (pos1 && pos2) {
        sum += similar_text(first.substr(0, pos2), second.substr(0, pos2));
      }

      if ((pos1 + max < firstLength) && (pos2 + max < secondLength)) {
        sum += similar_text(first.substr(pos1 + max, firstLength - pos1 - max), second.substr(pos2 + max, secondLength - pos2 - max));
      }
    }

    if (!percent) {
      return sum;
    } else {
      return (sum * 200) / (firstLength + secondLength);
    }
  },
  tokenize: function (str) {
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
        if(member.length > 2) {
         result.push(member);
       }
     }
   }
   return result;
 }

   return grep( str.split(re) );   // note: filter function omitted 
                                   //       since all we need to test 
                                   //       for is truthiness
  }
};