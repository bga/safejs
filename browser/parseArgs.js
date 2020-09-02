var wordRE = /\S+/.source;
var doubleQuotedStringRE  = /\"([^\\\"]*\\.)*[^\"]*\"/.source;
var quotedStringRE = doubleQuotedStringRE.replace(/\"/g, '\'');

var splitRE = RegExp(
  [
    doubleQuotedStringRE,
    quotedStringRE,
    wordRE,
  ].join('|')
, 'g');

exports._ = function(s) {
  var match = null
  var out = []
  splitRE.lastIndex = 0
  while(splitRE.lastIndex < s.length && (match = splitRE.exec(s))) {
    var a = match[0]
    if(a.charAt(0).match(/^[\"\']/)) {
      a = a.slice(1, -1)
    }
    out.push(a)
  }
  return out
};