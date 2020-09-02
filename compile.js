//? support $pp
//? support ?? for Option

;(function(){

var log = this.log || this.console && this.console.log.bind(console)
var noLog = function() {  }
var yes = !0, no = !1
var global = this

var assert = function(expr, msg) {
  if(!expr) {
    throw Error(msg)
  }
}

if(typeof(exports) == "undefined") {
  eval("var exports = this")
}

with(exports) {

//# issue w/ loop
exports.IS_SUPPORT_CONST = 0 && (function()
{
  try{ eval('const a = 1'); return 1 } catch(err){ return 0 }
})()

var repString = function(s, n) {
  return Array(n + 1).join(s)
}

exports.exprToBlank = function(s) {
  return repString("\n", s.split("\n").length - 1)
}

exports.skipPoint = "\x00"
exports.replaceAll = function(s, re, transform) {
  var pos = 0
  for(;;) {
    var match = s.match(re, pos)
    if(match == null) {
      break
    }
    var ret = transform(match)
    var skipPointPos = ret.indexOf(skipPoint)
    if(skipPointPos != -1) {
      ret = ret.slice(0, skipPointPos) + ret.slice(skipPointPos + 1)
    }
    s = s.slice(0, match.index) + ret + s.slice(match.index + match[0].length)
    if(skipPointPos != -1) {
      pos = match.index + skipPointPos
    }
    else {
      pos = match.index + ret.length
    }
  }
  return s
} 

exports.replaceAllBackward = function(s, re, transform) {
  var pos = 0
  var matches = []
  //# collect all matches
  for(;;) {
    var match = s.match(re, pos)
    if(match == null) {
      break
    }
    matches.push(match)
    pos = getLastPos(match)
  }
  //# traverse by it back, { skipPoint } is useless
  var i = matches.length - 1
  for(;;) {
    if(i < 0) {
      break
    }
    var match = matches[i]
    //# back compatibility
    match.input = s
    var ret = transform(match).replace(RegExp(skipPoint, "g"), "")
    s = s.slice(0, match.index) + ret + s.slice(getLastPos(match))
    //# seek to prev match
    for(;;) {
      i -= 1
      if(i < 0) {
        break
      }
      if(getLastPos(matches[i]) <= match.index) {
        break
      }
    }
  }  
  return s
} 

exports.escapeForRegExpReplace = function(s) {
  return s.replace(/\$/, "$$$$")
}

exports.isBlankLine = function(s) { 
  return s.match(/^[ ]*$/) 
}


exports.curry = function(f, args) {
  return function() {
    return f.apply(null, args.concat([].slice.call(arguments)))
  }
}

exports.toUnixEol = function(s) {
  var p = s.indexOf('\n')
  
  //# mac format
  if(p < 0) { 
    return s.replace(/\r/g, '\n')
  }
  //# win format
  else if(s.charAt(p - 1) == '\r') {
    return s.replace(/\r/g, '')
  } 
  //# unix format
  else {
    return s  
  }
}

//# bit augmentation is possible here
;(function() {
  var oldMatch = String.prototype.match
  String.prototype.match = function(re, pos) {
    if(re.global) {
      re = RegExp(re.source, "".concat(((re.ignoreCase) ? "i" : ""), ((re.multiline) ? "m" : "")))
    }
    if(pos == null) {
      pos = 0
    }
    else if(pos < 0) {
      pos = this.length + pos
      if(pos < 0) {
        pos = 0
      }
    }
    //# assuming you dont match /$/ or { re } that can match empty string
    else if(pos >= this.length) {
      return null
    }
    
    var m = oldMatch.call(this.slice(pos), re)
    if(m != null) {
      m.index += pos
      //# to primitive
      m.input = "" + this
    }
    return m
  }
})()

var hexDump = function(s) {
  return s.split("").map(function(v) { return v.charCodeAt(0).toString(16) }).join(" ")
}

/**
  transform(and back) number to string of whitespaces, gives {bound} which marks begin and end of such whitespace code, {bound} isnt from {commonWSes} such as ' ', '\n', '\r', '\t' to avoid confusion when decoding back
*/
exports.wsCoder = (function() {
  var commonWSes = '\u0009\u000D\u0020'
  var woCommon = '\u000B\u000C\u00A0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF'
  var woCommon = woCommon.replace(/[^\s]/g, '')  
  var bound = woCommon.charAt(0)
  var wses = commonWSes + woCommon.slice(1)
  
  return {
    bound: bound,
    
    encode: function(id) {
      var out = ''
      while(id > 0) {  
        out += wses.charAt(id % wses.length)
        id = 0|(id / wses.length)
      }
      return out
    },
    
    decode: function(str) {
      var id = 0
      var shift = 1
      var i = -1; while(++i < str.length) {
        id += shift * wses.indexOf(str.charAt(i))
        shift *= wses.length
      }
      return id
    }
  }  
})()

exports.getLastPos = function(m) {
  return m.index + m[0].length
}

exports.linesCount = function(s) {
  return s.split("\n").length
}

var StringLiteralAndCommentCoder = function() {
  this.nextId = 0  
  this.idToContent = {} 
}

StringLiteralAndCommentCoder.prototype.replacement = function(what) {
  var id = this.nextId++
  this.idToContent[id] = what
  return wsCoder.bound + wsCoder.encode(id) + wsCoder.bound + repString("\n", linesCount(what) - 1)
}
StringLiteralAndCommentCoder.prototype.replacementAsSymbol = function(what) {
  var id = this.nextId++
  this.idToContent[id] = what
  return "q" + id.toString(16) + "p" + repString("\n", linesCount(what) - 1)
}

StringLiteralAndCommentCoder.prototype.decode = function(s) { var thi$ = this
  var log = noLog
  for(;;) {
    var oldS = s
    s = ((" " + s + " ")
      .replace(RegExp(wsCoder.bound + "([^" + wsCoder.bound + "]*)" + wsCoder.bound + "(\\n*)", "g"), function(all, wsSeq, restLinesString) {
        log(hexDump(all))
        var content = thi$.idToContent[wsCoder.decode(wsSeq)]
        log(linesCount(content), restLinesString.length)
        return content + restLinesString.slice(0, restLinesString.length - linesCount(content) + 1)
      })
      .replace(/([\s\-!\(\[])q([\da-f]+)p([\s:;,\.\)\]])(\n*)/g, function(all, prefix, idAsHex, postfix, restLinesString) {
        var content = thi$.idToContent[parseInt(idAsHex, 16)]
        log(linesCount(content), restLinesString.length)
        if(postfix == "\n") {
          restLinesString = postfix + restLinesString
          postfix = ""
        }
        return prefix + content + postfix + restLinesString.slice(0, restLinesString.length - linesCount(content) + 1)
      })
    ).slice(1, -1)
    if(oldS == s) {
      break
    }
  }
  return s
}

/**
  transform templates to code, multiline string to strings, replace all string to symbols, replace all comments to whitespace code
*/
exports.SafeJsStringLiteralAndCommentCoder = (function() {
  var quoteString = function(s) {
    return s.replace(/\\/g, '\\\\').replace(/\"/g, '\\"')
  }

  var transformString = function(s) {
    var spacesRE = /^[ ]*/
    //# multiline indented string
    if(s.match(/^[ ]*\n/)) {
      var lines = s.split('\n')
      assert(lastV(lines).match(/^[ ]*$/), 'multiline string should ends by line w/ spaces')
      var ind = lastV(lines)
      assert(
        lines.length > 2,
        'multiline string can not be empty'
      )
      assert(    
        Math.min.apply(null, (lines
            .slice(1, -1)
            .filter(function(s) { 
              return !isBlankLine(s) 
            })
            .map(function(s) { 
              return s.match(spacesRE)[0].length 
            })
          )
        ) >= ind.length + 2,
        'multiline string should be indented by 2 spaces more then end quote'
      )
      
      return ('[""\n' 
        + (lines
          .slice(1, -1)
          .map(function(s) { 
            return s.slice(ind.length + 2) 
          })
          .map(function(s) { 
            return ind + ',"' + quoteString(s) + '"'
          })
          .join("\n")
        )
        + "\n" + ind + '].join("\\n").slice(1)'
      )  
    }
    //# one line string
    else {
      return '"' + quoteString(s) + '"'
    }
  }

  var $r = function() {
    StringLiteralAndCommentCoder.call(this)
  }
  
  $r.prototype = Object.create(StringLiteralAndCommentCoder.prototype)
  
  $r.prototype.encode = function(s) { var thi$ = this
    var log = noLog
    return replaceAll("\n" + s + "\n", 
      RegExp([
        /[\"`]/, // 1
        /\/\*[\s\S]*?\*\//,  // 2
        /(\n[ ]*)(\/\/.*)(?=\n)/, // 3
        /\/[^\s\/]/,  // 6
        /(\n[ ]*)#[ ](.*)(?=\n)/, // 7 
        /(\n[ ]*)\?[ ](.*)(?=\n)/, // 10
      ]
        .map(function(re) {
          return "".concat("(", re.source, ")")
        })
        .join("|")
      ), 
      function(m) {
        var $r = null
        var mShift = 0
        var s = m.input
        log(s)
        log(s.slice(m.index, m.index + 5))
        
        //# string
        if(m[mShift = 1]) { 
          //# dsl string
          if(s.charAt(m.index) == "`") { 
            var q
            //# multiline string
            if(s.charAt(m.index + 1) == "\n") {
              var ind = getIndent(s.slice(s.lastIndexOf("\n", m.index)))
              q = skipSpaces(s, matchString(s, RegExp(ind + "[^ ]"), m.index).index + 1)
            }
            //# single line string
            else {
              log("single line", "!" + s.slice(m.index, m.index + 10))
              q = s.indexOf("`", m.index + 1)
            }
            $r = thi$.replacementAsSymbol(transformString(s.slice(m.index + 1, q)))
            m[0] = s.slice(m.index, q + 1)
            log(m[0])
          }
          //# i18n string
          else if(s.charAt(m.index) == "\"") {
            var q = getLastPos(s.match(/^([^\"]*\"\")*[^\"]*/, m.index + 1))
            //out += thi$.replacementAsSymbol("eval(i18n(" + transformString(s.slice(p + 1, q)) + "))")
            $r = "eval(i18n(" + thi$.replacementAsSymbol(transformString(s.slice(m.index + 1, q))) + "))"
            m[0] = s.slice(m.index, q + 1)
          }
          else {
            assert(no, "Unknown type of string")
          }
        }

        //# native block comment
        else if(m[mShift = 2]) { 
          $r = thi$.replacement(m[mShift + 0])
        }

        //# native line comment
        else if(m[mShift = 3]) { 
          $r = m[mShift + 1] + thi$.replacement(m[mShift + 2])
        }
        
        //# regexp
        else if(m[mShift = 6]) { 
          var find = function(p) {
            var reMatchRE = /(\\)|(\/)/g
            var m = null
            reMatchRE.lastIndex = p
            while((m = reMatchRE.exec(s)) != null) {
              p = reMatchRE.lastIndex
              if(m[1]) {
                p += 1
              }
              else {
                return p
              }
              reMatchRE.lastIndex = p
            }
          }

          var q = getLastPos(s.match(/^[a-z]*/, find(m.index + 1))) 
          log(s.slice(m.index, q))
          $r = thi$.replacementAsSymbol(s.slice(m.index, q))
          m[0] = s.slice(m.index, q)
          log(m[0])
        }

        //# doc comment
        else if(m[mShift = 7]) { 
          var ind = m[mShift + 1]
          var content = m[mShift +2]
          
          var assertMatch = m.input.match(/^(\s*)assert\(/, getLastPos(m))
          //# doc for assert
          if(assertMatch != null) {
            var p = getLastPos(m)
            var q = matchCloseBracket(m.input, getLastPos(assertMatch) - 1)
            m[0] = m.input.slice(m.index, q)
            $r = (ind + "var doc$ = " + thi$.replacementAsSymbol("\"" + quoteString(content) + "\"")
              + m.input.slice(p, q - 1) + ", doc$)" 
            )  
          }
          //# doc for hash literal item
          else with({ hashLiteralMatch: m.input.match(/^\s*([\w_$]+):/, getLastPos(m))}) if(hashLiteralMatch) {
            var matchedName = hashLiteralMatch[1]
            var docSlotName = matchedName + "Doc$"
            $r = ind + docSlotName + ": " + thi$.replacementAsSymbol("\"" + quoteString(content) + "\"")
          }
          else {
            //# just converst to native line comment
            $r = ind + thi$.replacement("//# " + content)
          }
        }

        //# debug comment
        else if(m[mShift = 10]) { 
          $r = m[mShift + 1] +thi$.replacement("//? " + m[mShift + 2])
        }
          
        //# debug block comment, can be nested
        else if(m[mShift = -1]) {
          var find = function(p) {
            var matchRE = /(\/\?)|(\?\/)/g
            matchRE.lastIndex = p
            while((match = matchRE.exec(s)) != null) {
              p = matchRE.lastIndex
              if(match[1] != "") {
                p = find(p)
              }
              if(match[2]) {
                return p
              }
              matchRE.lastIndex = p
            }
          }
          
          // TODO convert to native block comment
          var id = thi$.nextId++
          out += wsCoder.encode(id)
          thi$.idToContent[id] = s.slice(p, (p = find(p)))
          
        }  
        else {
          assert(no, "Unknown mShift = ", mShift)
        }  
        return $r
      }
    ).slice(1, -1)
  }
  return $r
})()

//? untested
exports.JsStringLiteralAndCommentCoder = (function() {
  var quoteString = function(s) {
    return s.replace(/\\/g, '\\\\').replace(/\"/g, '\\"')
  }

  var transformString = function(s) {
    var spacesRE = /^[ ]*/
    //# multiline indented string
    if(s.match(/^[ ]*\n/)) {
      var lines = s.split('\n')
      assert(lastV(lines).match(/^[ ]*$/), 'multiline string should ends by line w/ spaces')
      var ind = lastV(lines)
      assert(
        lines.length > 2,
        'multiline string can not be empty'
      )
      assert(    
        Math.min.apply(null, (lines
            .slice(1, -1)
            .filter(function(s) { 
              return !isBlankLine(s) 
            })
            .map(function(s) { 
              return s.match(spacesRE)[0].length 
            })
          )
        ) >= ind.length + 2,
        'multiline string should be indented by 2 spaces more then end quote'
      )
      
      return ('[""\n' 
        + (lines
          .slice(1, -1)
          .map(function(s) { 
            return s.slice(ind.length + 2) 
          })
          .map(function(s) { 
            return ind + ',"' + quoteString(s) + '"'
          })
          .join("\n")
        )
        + "\n" + ind + '].join("\\n").slice(1)'
      )  
    }
    //# one line string
    else {
      return '"' + quoteString(s) + '"'
    }
  }

  var $r = function() {
    StringLiteralAndCommentCoder.call(this)
  }
  
  $r.prototype = Object.create(StringLiteralAndCommentCoder.prototype)
  
  $r.prototype.encode = function(s) { var thi$ = this
    var log = noLog
    return replaceAll("\n" + s + "\n", 
      RegExp([
        /[\"\']/, // 1
        /\/\*[\s\S]*?\*\//,  // 2
        /(\n[ ]*)(\/\/.*)(?=\n)/, // 3
        /\/[^\s\/]/,  // 6
      ]
        .map(function(re) {
          return "".concat("(", re.source, ")")
        })
        .join("|")
      ), 
      function(m) {
        var $r = null
        var mShift = 0
        var s = m.input
        
        //# string
        if(m[mShift = 1]) { 
          if(s.charAt(m.index) == "\"") {
            var q = getLastPos(s.match(/^([^\\\"]*\\[\s\S])*[^\"]*\"/, m.index + 1))
            m[0] = s.slice(m.index, q)
            $r = thi$.replacementAsSymbol(s.slice(m.index, q))
          }
          else if(s.charAt(m.index) == "'") {
            var q = getLastPos(s.match(/^([^\\\']*\\[\s\S])*[^\']*\'/, m.index + 1))
            m[0] = s.slice(m.index, q)
            $r = thi$.replacementAsSymbol(s.slice(m.index, q))
          }
          else {
            assert(no, "Unknown type of string")
          }
        }

        //# native block comment
        else if(m[mShift = 2]) { 
          $r = thi$.replacement(m[mShift + 0])
        }

        //# native line comment
        else if(m[mShift = 3]) { 
          $r = m[mShift + 1] + thi$.replacement(m[mShift + 2])
        }
        
        //# regexp
        else if(m[mShift = 6]) { 
          var find = function(p) {
            var reMatchRE = /(\\)|(\/)/g
            var m = null
            reMatchRE.lastIndex = p
            while((m = reMatchRE.exec(s)) != null) {
              p = reMatchRE.lastIndex
              if(m[1]) {
                p += 1
              }
              else {
                return p
              }
              reMatchRE.lastIndex = p
            }
          }

          var q = getLastPos(s.match(/^[a-z]*/, find(m.index + 1))) 
          $r = thi$.replacementAsSymbol(s.slice(m.index, q))
          m[0] = s.slice(m.index, q)
        }

        else {
          assert(no, "Unknown mShift = ", mShift)
        }  
        return $r
      }
    ).slice(1, -1)
  }
  return $r
})()

exports.CssStringLiteralAndCommentCoder = (function() {
  var quoteString = function(s) {
    return s.replace(/\\/g, '\\\\').replace(/\"/g, '\\"')
  }

  var $r = function() {
    StringLiteralAndCommentCoder.call(this)
  }
  
  $r.prototype = Object.create(StringLiteralAndCommentCoder.prototype)
  
  $r.prototype.encode = function(s) { var thi$ = this
    var log = noLog
    return replaceAll("\n" + s + "\n", 
      RegExp([
        /[\"']/, // 1
        /\/\*[\s\S]*?\*\//,  // 2
        /(\n[ ]*)\/\/(.*)(?=\n)/, // 3
        /(\n[ ]*)#[ ](.*)(?=\n)/, // 6 
        /(\n[ ]*)\?[ ](.*)(?=\n)/, // 9
      ]
        .map(function(re) {
          return "".concat("(", re.source, ")")
        })
        .join("|")
      ), 
      function(m) {
        var $r = null
        var mShift = 0
        var s = m.input
        
        //# string
        if(m[mShift = 1]) { 
          if(s.charAt(m.index) == "\"") {
            var q = getLastPos(s.match(/^([^\\\"]*\\[\s\S])*[^\"]*\"/, m.index + 1))
            $r = thi$.replacementAsSymbol(s.slice(m.index, q))
            m[0] = s.slice(m.index, q)
          }
          else if(s.charAt(m.index) == "'") {
            var q = getLastPos(s.match(/^([^\\\']*\\[\s\S])*[^\']*\'/, m.index + 1))
            $r = thi$.replacementAsSymbol(s.slice(m.index, q))
            m[0] = s.slice(m.index, q)
          }
          else {
            assert(no, "Unknown type of string - ", s.charAt(m.index))
          }
        }

        //# native block comment
        else if(m[mShift = 2]) { 
          $r = thi$.replacement(m[mShift + 0])
        }

        //# debug line comment
        else if(m[mShift = 3]) { 
          return m[mShift + 1] + thi$.replacement("".concat("/* ", m[mShift + 2].replace(/^[ ]+/, ""), " */"))
        }
        //# doc comment
        else if(m[mShift = 6]) { 
          return m[mShift + 1] + thi$.replacement("".concat("/*# ", m[mShift + 2].replace(/^[ ]+/, ""), " */"))
        }
        //# remark/todo comment
        else if(m[mShift = 9]) { 
          return m[mShift + 1] + thi$.replacement("".concat("/*? ", m[mShift + 2].replace(/^[ ]+/, ""), " */"))
        }
        else {
          assert(no, "Unknown mShift = ", mShift)
        }  
        return $r
      }
    ).slice(1, -1)
  }
  return $r
})()

exports.CStringLiteralAndCommentCoder = (function() {
  var quoteString = function(s) {
    return s.replace(/\\/g, '\\\\').replace(/\"/g, '\\"')
  }

  var transformString = function(s) {
    var spacesRE = /^[ ]*/
    //# multiline indented string
    if(s.match(/^[ ]*\n/)) {
      var lines = s.split('\n')
      assert(lastV(lines).match(/^[ ]*$/), 'multiline string should ends by line w/ spaces')
      var ind = lastV(lines)
      assert(
        lines.length > 2,
        'multiline string can not be empty'
      )
      assert(    
        Math.min.apply(null, (lines
            .slice(1, -1)
            .filter(function(s) { 
              return !isBlankLine(s) 
            })
            .map(function(s) { 
              return s.match(spacesRE)[0].length 
            })
          )
        ) >= ind.length + 2,
        'multiline string should be indented by 2 spaces more then end quote'
      )
      
      return ('(""\n' 
        + (lines
          .slice(1, -1)
          .map(function(s) { 
            return s.slice(ind.length + 2) 
          })
          .map(function(s, i) { 
            return ind + ' "' + quoteString(s)  + '\\n"'
          })
          .join("\n").slice(0, -3) + '"'
        )
        + "\n" + ind + ')'
      )  
    }
    //# one line string
    else {
      return '"' + quoteString(s) + '"'
    }
  }

  var $r = function() {
    StringLiteralAndCommentCoder.call(this)
  }
  
  $r.prototype = Object.create(StringLiteralAndCommentCoder.prototype)
  
  $r.prototype.encode = function(s) { var thi$ = this
    var log = noLog
    return replaceAll("\n" + s + "\n", 
      RegExp([
        /[\"`]/, // 1
        /\/\*[\s\S]*?\*\//,  // 2
        /(\n[ ]*)(\/\/.*)(?=\n)/, // 3
        /(\n[ ]*)#[ ](.*)(?=\n)/, // 6 
        /(\n[ ]*)\?[ ](.*)(?=\n)/, // 9
      ]
        .map(function(re) {
          return "".concat("(", re.source, ")")
        })
        .join("|")
      ), 
      function(m) {
        var $r = null
        var mShift = 0
        var s = m.input
        log(s)
        log(s.slice(m.index, m.index + 5))
        
        //# string
        if(m[mShift = 1]) { 
          //# dsl string
          if(s.charAt(m.index) == "`") { 
            var q
            //# multiline string
            if(s.charAt(m.index + 1) == "\n") {
              var ind = getIndent(s.slice(s.lastIndexOf("\n", m.index)))
              q = skipSpaces(s, matchString(s, RegExp(ind + "[^ ]"), m.index).index + 1)
            }
            //# single line string
            else {
              log("single line", "!" + s.slice(m.index, m.index + 10))
              q = s.indexOf("`", m.index + 1)
            }
            $r = thi$.replacementAsSymbol(transformString(s.slice(m.index + 1, q)))
            m[0] = s.slice(m.index, q + 1)
            log(m[0])
          }
          //# i18n string
          else if(s.charAt(m.index) == "\"") {
            var q = getLastPos(s.match(/^([^\"]*\"\")*[^\"]*/, m.index + 1))
            //out += thi$.replacementAsSymbol("eval(i18n(" + transformString(s.slice(p + 1, q)) + "))")
            $r = "eval(i18n(" + thi$.replacementAsSymbol(transformString(s.slice(m.index + 1, q))) + "))"
            m[0] = s.slice(m.index, q + 1)
          }
          else {
            assert(no, "Unknown type of string")
          }
        }

        //# native block comment
        else if(m[mShift = 2]) { 
          $r = thi$.replacement(m[mShift + 0])
        }

        //# native line comment
        else if(m[mShift = 3]) { 
          //$r = m[mShift + 1] + thi$.replacement(m[mShift + 2])
          $r = m[mShift + 1] + thi$.replacement("".concat("/* ", m[mShift + 2].slice(2), " */"))
        }
        
        //# doc comment
        else if(m[mShift = 6]) { 
          var ind = m[mShift + 1]
          var content = m[mShift + 2]
          
          var assertMatch = m.input.match(/^(\s*)assert\(/, getLastPos(m))
          //# doc for assert
          if(assertMatch != null) {
            var p = getLastPos(m)
            var q = matchCloseBracket(m.input, getLastPos(assertMatch) - 1)
            m[0] = m.input.slice(m.index, q)
            $r = (ind + "var doc$ = " + thi$.replacementAsSymbol("\"" + quoteString(content) + "\"")
              + m.input.slice(p, q - 1) + ", doc$)" 
            )  
          }
          //# doc for hash literal item
          else with({ hashLiteralMatch: m.input.match(/^\s*([\w_$]+):/, getLastPos(m))}) if(hashLiteralMatch) {
            var matchedName = hashLiteralMatch[1]
            var docSlotName = matchedName + "Doc$"
            $r = ind + docSlotName + ": " + thi$.replacementAsSymbol("\"" + quoteString(content) + "\"")
          }
          else {
            //# just converst to native line comment
            $r = ind + thi$.replacement("/*# " + content + " */")
          }
        }

        //# debug comment
        else if(m[mShift = 9]) { 
          $r = m[mShift + 1] +thi$.replacement("/*? " + m[mShift + 2] + " */")
        }
          
        else {
          assert(no, "Unknown mShift = ", mShift)
        }  
        return $r
      }
    ).slice(1, -1)
  }
  return $r
})()

exports.compile = function(s, transformers, stringLiteralAndCommentCoder) {
  var out = toUnixEol(s).replace(/[ ]*$/gm, "")
  var i = -1; while(++i < transformers.length) {
    out = stringLiteralAndCommentCoder.encode(out)
    out = transformers[i](out)
  }
  out = stringLiteralAndCommentCoder.encode(out)
  out = stringLiteralAndCommentCoder.decode(out)
  
  //return out
  return out;
};

var RE = function(re) {
  re = RegExp(re)
  re.lastIndex = 0;
  return re
}

exports.arrayToObject = function(strings) {
  var obj = {  }
  strings.forEach(function(v) {
    obj[v] = 1
  })
  return obj
}
exports.transformFreeSymbolsToLazyLoad = function(buildInSymbols, s) {
  var transformFn = function(s, foundVarMap) {
    var pos = s.match(/^function\s*[a-zA-Z0-9_$]*\(/)[0].length
    var argsString = s.slice(pos, pos = s.indexOf(")", pos))
    var args = argsString.split(",")
    var i = args.length; while(i--) {
      foundVarMap[args[i].trim()] = 1
    }

    //? support { catch }
    var matchRE = RE(/((?:\s|\()(?:var|const|let)\s+)|([\s\(\[]function\s*[a-zA-Z0-9_$]*\()|(\scatch\([\w$]+\))|([\s\(\[](?=[a-zA-Z_$]))/g)
    var match = null
    var out = ""

    matchRE.lastIndex = pos
    pos = 0
    while((match = matchRE.exec(s)) != null) {
      out += s.slice(pos, matchRE.lastIndex - match[0].length)
      //? log(out)
      //? throw 1
      var pos = matchRE.lastIndex
      var i = 0; while(++i < match.length && (match[i] || '') == '') {

      }
      switch(i) {
        //# declare symbol
        case 1: {
          var varMatch = s.slice(pos).match(/^\s*([\w_$][\w\d_$]*)/i)
          var varName = varMatch[1]
          foundVarMap[varName] = 1
          out += match[0] + varMatch[0]
          pos += varMatch[0].length
        } break
        //# fn
        case 2: {
          var q = matchCloseBracket(s, s.indexOf('{', pos))
          out += s.charAt(pos - match[0].length) + transformFn(s.slice(pos - match[0].length + 1, q), Object.create(foundVarMap))
          pos = q
        } break
        //# use of symbol
        case 3: {
          out += match[0]
          foundVarMap[match[0].slice(7, -1).trim()] = 1
        } break
        case 4: {
          var varMatch = s.slice(pos).match(/^([a-z_$][a-z\d_$]*)/i)
          var varName = varMatch[1]
          out += match[0]
          //# already declared
          //? { varName } can be in { Object.prototype }
          if(varName in foundVarMap
            || s.slice(0, pos).match(/break\s$/)
            //# temp symbol
            || varName.match(/^q[\da-f]+p$/) 
            //# part of hash
            || s.charAt(pos + varName.length) == ":" 
            //# system symbol
            || varName == "$"
            //# recursion
            || varName == "load"
            //|| varName.match(/^\$|\$$/)
          ) {
            out += varName
          }
          else {
            out += "load(`" + varName + "`)"
          }
          pos += varMatch[0].length
        } break
      }
      matchRE.lastIndex = pos
    }
    out += s.slice(pos)
    return out
  }

  var buildIns = {  }
  var buildInNames = "arguments this eval true false null return throw yield break if else switch case for while do default with instanceof in typeof new delete try finally debugger".split(/\s+/)  
  var i = buildInNames.length; while(i--) {
    buildIns[buildInNames[i]] = 1
  }
  //log(Object.keys(buildInSymbols))
  for(var i in buildInSymbols) {
    if(buildInSymbols.hasOwnProperty(i)) {
      buildIns[i] = 1
    }
  }

  return transformFn("function() { " + s + " }", buildIns).slice(13, -2)
}

exports.transformFns = function(s) {
  var log = noLog
  //# new style
  s = s.replace(/(\s)\?\=(\s)/g, "$1=$2")
  var matchRE = /#\(/g
  matchRE.lastIndex = s.length
  var match
  while((match = matchLast(s, matchRE)) != null) {
    var p = matchRE.lastIndex
    var args = []
    for(;;) {
      p = skipSpaces(s, p)
      if(s.match(/^\)/, p)) {
        break
      }
      var def = {}
      var isRest = no
      if(s.match(/^\.\.\./, p)) {
        p += 3
        isRest = yes
      }
      p = parseVar(s, p, def, /,|\)|$/)
      if(s.match(/^,/, p)) {
        p += 1
      }
      if(def.name == null) {
        break
      }
      args.push({
        name: def.name.trim(), 
        defV: (def.v || '').trim(), 
        isRest: isRest
      }) 
    }
    
    p = matchExprEnd(s, p + 1, /{/) + 1
    var bodyExtras = ["{ var $r = null }"]
    //# moving to new standard
    if(0 && args.length > 0 && args[0].name == "p") {
      args[0].name = "@"
    }
    //log(args)
    assert(args.filter(function(v) { return v.isRest }).length <= 1, "it can be only one variadic arg")
    assert(args.every(function(v) { return v.isRest ? v.defV == "" : yes }), "variadic args can not has default value")
    assert(args.filter(function(v) { return v.isRest }).length == 1 ? args.length == 1 || args.length == 2 && args[0].name == "p" : yes, "in case of usage variadic args you can not use ordinary args, except @")

    if(args.length > 0 && args[0].name == 'p') {
      bodyExtras.push('{ var p = this }')
      args = args.slice(1)
    }

    //log(args.map(function(v){ return v.arg }))
    bodyExtras = bodyExtras.concat((args
      .filter(function(v){ return v.isRest })
      .map(function(v){ return "{ var " + v.name + " = [].slice.call(arguments, 0) }" })
    ))
    bodyExtras = bodyExtras.concat((args
      .filter(function(v){ return v.defV > '' })
      .map(function(v){ return "".concat("if(", v.name, " == null) { ", v.name, " = ", v.defV, " }") })
    ))
    log(s.slice(p - 1, p + 10))
    var q = matchCloseBracket(s, p - 1)
    s = s.slice(0, match.index) + "".concat(
      "function(", 
      (args
        .filter(function(v) { return !v.isRest })
        .map(function(v){ return v.name })
        .join(', ')
      ), 
      ") {", 
      ((bodyExtras.length > 0) ? ' ' : '') + bodyExtras.join(' ')
    ) + s.slice(p, q - 1) + ";return $r" + s.slice(q - 1)  
    //) + s.slice(p)  
  }

  return s
}

exports.expandAbbrs = function(s) {
  return s.replace(/([\s\!~\-\(\)\[\]\{\}\.])([a-zA-Z0-9&|]+?)(?=[\s\!~\-\(\)\[\]\{\}\.])/g, function(all, before, name) {
    if(name.match(/^\&|\&$/) || !name.match(/[a-z]/i) || name.match(/^(\d+([eE]\d+)?|0x[\da-fA-F_]+|0b[0-1_])$/)) {
      return all
    }
    else {
      //log(name)
      return (before 
        + (name
          .replace(/&/g, "And")
          .replace(/\|/g, "Or")
          .replace(/^(?=\d)/g, "_")
        )
      )
    }
  })
}

exports.transformExport = function(s) {
  return (" " + s).replace(/(\s)(export\s+)((?:var|const)\s+?([a-zA-Z_$][a-zA-Z_$0-9]*))?/g, function(all, pad, prefix, alloc, name) {
    if(alloc) {
      //log(alloc)
      return pad + alloc + " = localScope$.self = = localScope$.Self"
    }
    else {
      return pad + "localScope$.self = localScope$.Self = "
    }
  }).slice(1)  
}

exports.escapeForRegExp = function(s)
{
  return s.replace(/[\[\]\(\)\{\}\?\!\:\|\+\.\*\'\"\\\/\^\$]/g, '\\$&');
}

// currently it does not cache anything
exports.matchLast = function(thi$, re, p) {
  assert(re.global, "regexp must be with global flag")
  if(p != null) {
    re.lastIndex = p
  }
  var s = thi$.slice(0, re.lastIndex)
  re.lastIndex = 0
  var prevMatch = null
  var prevLastIndex = thi$.length
  var match
  for(;;) {
    prevMatch = match
    prevLastIndex = re.lastIndex
    match = re.exec(s)
    if(match == null || re.lastIndex == prevLastIndex) {
      break
    }
  }
  if(prevMatch == null) {
    re.lastIndex = 0
  }
  else {
    re.lastIndex = prevLastIndex
  }
  return prevMatch
}

exports.PosError = function(msg, p) {
  return  {
    msg: msg,
    p: p
  }
}

;(function(){
  var matchCloseRE 
  var matchOpenRE 
  var openToCloseBrace = {} 
  var closeToOpenBrace = {} 
  
  ;(function(){
    var braces = [
      {open: '{', close: '}'},
      {open: '[', close: ']'},
      {open: '(', close: ')'}
    ]
    var i = braces.length; while(i--)
    {  
      openToCloseBrace[braces[i].open] = braces[i].close
      closeToOpenBrace[braces[i].close] = braces[i].open
    }
    var reStrs = []
    var i = braces.length; while(i--)
    {  
      reStrs.push(escapeForRegExp(braces[i].open))
      reStrs.push(escapeForRegExp(braces[i].close))
    }
    matchOpenRE = RegExp('(.)([^' + reStrs.join('') + ']*?)$')
    matchCloseRE = RegExp(reStrs.join('|') + '|$', 'g')
  })()  

  exports.matchCloseBracket = function(s, p, isCheckLiterals){
    if(p == null)
      p = 0
    var isInLiteral = (
      /*
      isCheckLiterals && (#{
        var checkRE = RegExp(`(\/\*|\/\/|%opRE[\s\S]*[\'\"\/])[\s\S]*$`)
        -> #{
          -> checkRE.test(s.slice(matchRE.lastIndex - 1))
        }
      })()
      || */ function(){ return  no }
    )
    
    var matchRE = matchCloseRE
    var stack = []
    var match
    matchRE.lastIndex = p
    while((match = matchRE.exec(s)) != null)
    {
      if(isInLiteral())
        continue
      
      var p = matchRE.lastIndex
      if(match[0] == '') // eof
      {
        if(stack.length > 0)
          throw PosError(''.concat('Unmatched ', openToCloseBrace[lastV(stack)], ' before ', lastV(stack)), p)
        else
          return  p
      }
      if(match[0] in openToCloseBrace)
      {  
        stack.push(match[0])
      }
      else
      {
        var lastBrace = stack.pop()
        if(openToCloseBrace[lastBrace] != match[0])
          throw PosError(''.concat('Unmatched ', openToCloseBrace[lastBrace]), p)
        if(stack.length == 0)
          return  p
      }
    }
  }

  exports.matchOpenBracket = function(s, p, isCheckLiterals){
    if(p == null)
      p = s.length
    var isInLiteral = (
      /*
      isCheckLiterals && (#{
        var checkRE = RegExp(`(\/\*|\/\/|%opRE[\s\S]*[\'\"\/])[\s\S]*$`)
        -> #{
          -> checkRE.test(s.slice(matchRE.lastIndex - 1))
        }
      })()
      || */ function(){ return  no }
    )
    
    var matchRE = matchOpenRE
    var stack = []
    for(;;)
    {
      var match = matchRE.exec(s.slice(0, p))

      if(match == null) // eof
      {
        if(stack.length > 0)
          throw PosError(''.concat('Unmatched ', closeToOpenBrace[lastV(stack)], ' before ', lastV(stack)), p)
        else
          return  p
      }

      if(isInLiteral())
        continue
      
      p -= match[0].length
      if(match[1] in closeToOpenBrace)
      {  
        stack.push(match[1])
      }
      else
      {
        var lastBrace = stack.pop()
        if(closeToOpenBrace[lastBrace] != match[1])
          throw PosError(''.concat('Unmatched ', closeToOpenBrace[lastBrace]), p)
        if(stack.length == 0)
          return  p
      }
    }
  }
  
})()

exports.transformWith = function(s) {
  //trace()
  var isFixed = no
  var matchRE = /([\w\d_$\)\]])({)/g
  matchRE.lastIndex = 0
  var match
  while((match = matchRE.exec(s)) != null)
  {
    var p = matchRE.lastIndex
    switch(match[1])
    {
      case ')': // fn decl, statement, fn call, group op
        if(/(^|[\(\{+\s;])(try|do)\s*?$/.test(s.slice(0, p - match[2].length)))
          break
        var q = matchOpenBracket(s, p - match[2].length)
          
        //_log(s.slice(0, q))
        if(/(^|[\)\}\(\[\{+\s;])(function|while|for|if|with|catch)\s*$/.test(s.slice(0, q)))
          break
      default:
        var q = matchCloseBracket(s, p - 1)
        isFixed = yes
        s = (s.slice(0, p - 1) 
          + '.with$(function($) {'
          + s.slice(p, q - 1)
          + ';return $ })'
          + s.slice(q)
        )  
      matchRE.lastIndex = p + 18
    }
  }
  if(isFixed) {
    s = "using(objectWith$Mixin); " + s
  }
  return  s
}

exports.transformSelf = function(s) { 
  var log = noLog
  var isFixed = no
  var matchRE = /[\s\[\(\-~!]\$p[\.\s\[\(\)]/g
  matchRE.lastIndex = 0
  var match
  while((match = matchRE.exec(s)) != null) {
    log("--")
    var p = matchRE.lastIndex
    var exprBegin = p - match[0].length + 1
    while(1) {
      // ugly js regexps
      log(s.slice(exprBegin, exprBegin + 20))
      exprBegin = exprBegin - (/^([\s\S]*?)[\[\(][\w\)\]]/.exec(
        s.slice(0, exprBegin).split('').reverse().join('')
      )[1].length) - 1
      var exprEnd = matchCloseBracket(s, exprBegin)
      if(exprEnd <= p) // [exprBegin, exprEnd] is outside of p
        continue
      var isOk = no
      if(s.charAt(exprBegin) == '[')
        isOk = yes
      
      if(!isOk && /\.\!?[a-zA-Z_]+$/.test(s.slice(0, exprBegin)))
      {
        exprBegin = s.lastIndexOf('.', exprBegin)
        isOk = yes
      }
      
      if(!isOk)
        continue
      
      isFixed = yes
      var replace = "".concat(".p$(function($p) { return $p", s.slice(exprBegin, exprEnd), " })")
      s = s.slice(0, exprBegin) + replace + s.slice(exprEnd)
      matchRE.lastIndex = exprBegin + replace.length
      break
    }
  }
  if(isFixed) {
    s = "using(objectP$Mixin); " + s
  }
  return s
}

/* 
  a + b($f) -> ($f = a) + b($f)
  a + b + c($f) -> ($f = a + b) + c($f)
*/
exports.transformF = function(s) { 
  var log = noLog
  s = "\n" + s
  var prioritiesToRegExp = function(priorities) {
    return RegExp("\\s(?:" + priorities.replace(/(\s)\|\|(\s)/g, "$1|$2").replace(/\s+/g, "") + ")\\s", "g")
  }
  var binaryPriorities = /(&) || (\| | ^) || (\* | \/ | %) || (\+ | \-) || (\\!?\w) || ([<>]=? | [!=]=) || (&& | \|\|)/.source
  var matchRE = /[\s\[\(\-~!]\$f\W/g
  matchRE.lastIndex = 0
  var match
  while((match = matchRE.exec(s)) != null) {
    var metaFBegin = matchRE.lastIndex - match[0].length + 1
    var fBegin = metaFBegin
    // var i = 10
    for(;;) {
      log("fBegin", fBegin)
      fBegin = matchExprBegin(s, fBegin, /\(|\[|\s=\s/) 
      log("fBegin", fBegin)
      var fExpr = s.slice(fBegin, metaFBegin)
      var opMatch = matchLast(fExpr, prioritiesToRegExp(binaryPriorities), fExpr.length)
      log("547:", fExpr, opMatch)
      //# binary op, not =
      if(opMatch) {
        var priority = 0
        while(priority < opMatch.length && (opMatch[priority + 1] || "") != opMatch[0].slice(1, -1)) {
          priority += 1
        }
        assert(priority < opMatch.length - 2, "$f for logic ops is not supported")
        log(priority, opMatch.length)
        var lowerOrEqPriorities = binaryPriorities.split(" || ").slice(priority + 1).join(" || ")
        log("559:", prioritiesToRegExp(lowerOrEqPriorities))
        var realLocalFExprBegin = matchExprBegin(fExpr, fExpr.length - 1, prioritiesToRegExp(lowerOrEqPriorities))
        log("realLocalFExprBegin", realLocalFExprBegin, fExpr.slice(realLocalFExprBegin, realLocalFExprBegin + 10))
        if(realLocalFExprBegin == -1 >>> 0) {
          realLocalFExprBegin = 0
        }
        var realFExprBegin = skipSpaces(s, fBegin + realLocalFExprBegin)
        var realFExprEnd = skipSpacesBack(s, fBegin + opMatch.index)
        var wrappedRealExpr = s.slice(realFExprBegin, realFExprEnd)
        log(wrappedRealExpr)
        if(wrappedRealExpr.match(/^\(\$f = /) && matchCloseBracket(wrappedRealExpr, 0) == wrappedRealExpr.length) {
          //# skip
        }
        else {
          wrappedRealExpr = "($f = " + wrappedRealExpr + ")"
        }
        s = (s.slice(0, realFExprBegin) 
          + wrappedRealExpr
          + s.slice(realFExprEnd)
        )
        matchRE.lastIndex += 7
        break
      }
      //# = or no binary op
      else if(s.slice(fBegin - 3).match(/^\s=\s/)) {
        log("here")
        var realFExprEnd = skipSpacesBack(s, fBegin - 3)
        var realFExprBegin = skipSpaces(s, s.lastIndexOf("\n", realFExprEnd))
        //log(s.slice(realFExprBegin, realFExprEnd))
        if(s.slice(realFExprBegin).match(/^var\s/)) {
          realFExprBegin += 4
        }
        s = s.slice(0, metaFBegin) + s.slice(realFExprBegin, realFExprEnd) + s.slice(metaFBegin + 2)
        matchRE.lastIndex += realFExprEnd - realFExprBegin - 2
        break
      }
      //# brace
      else {
        log("581:", s.slice(fBegin, fBegin + 10))
        /* 
        if(--i < 0) {
          return
        }
        */
        fBegin -= 1
        //break
        //# skip
      }
    }
  }
  //log(s)
  return s.slice(1)
}

exports.getIndent = function(s) {
  return s.match(/^\n[ ]*/)[0]
}

exports.addBlindCommas = function(s) { 
  s = "\n" + s
  var log = noLog
  //var matchRE = /#\(|[\s\(]\[/g
  //# match hash's list and list's decl
  var matchRE = /[\s\(\[]([\[\{])\n/g
  matchRE.lastIndex = 0
  var match
  while((match = matchRE.exec(s)) != null) {
    var p = matchRE.lastIndex - 1
    var brace = s.charAt(p - 1)
    //# hash or block
    if(brace == "{") {
      //# avoid block
      log(s.slice(p - 10, p - 1) + "!")
      if(s.slice(0, p - 1).match(/([\)a-z]|\)\:)\s*$/) 
        && !s.slice(0, p - 1).match(/(return|throw|yield)\s*?$/)
      ) {
        log("skip")
        continue
      }
    }
    //log("brace", s.slice(p, p + 10), s.length, s)
    var q = matchCloseBracket(s, p - 1)
    //# if matched braces has new lines
    if(s.slice(p, q).split("\n").length > 2) {
      //# go line by line and add commas
      //# seek 1st line
      p = s.indexOf("\n", p)
      var indent = getIndent(s.slice(p))
      log("indent.length", indent.length - 1)
      p = s.indexOf("\n", p)
      q = s.lastIndexOf("\n", q)
      for(;;) {
        //# "skip" prev line
        p += 1
        //# seek new same indented line
        p = p + (s.slice(p).match(RegExp(indent + "[^ \n]")) || { index: Infinity }).index
        if(p >= q) {
          break
        }
        var thisLine = s.slice(p, s.indexOf("\n", p + 1))
        log("!" + thisLine + "!")
        if(
          //# not end of multiline expr
          thisLine.match(/^\s*[\)\]\};]/) == null 
          //# not empty line
          && thisLine.match(/^\s*$/) == null
        ) {
          log("matched line", s.slice(p, s.indexOf("\n", p + 1)))
          var commaPos = skipSpacesBack(s, p)
          if(s.charAt(commaPos - 1) != ",") {
            s = s.slice(0, commaPos) + "," + s.slice(commaPos)
            p += 1
          }
        }
      }
    }
    //# just skip
    else {
    }
  }
  return s.slice(1)
}

exports.bindBreaksToLoops = function(s) {
  var log = noLog
  var lines = s.split("\n")
  var loopsStack = []
  var i = -1; while(++i < lines.length) {
    var line = lines[i]
    var match
    log(line)
    if((match = line.match(/^(\s*)(?:(\w*):)?\s*loop/)) != null) {
      var labelOfLoop = match[2]
      if(labelOfLoop == null) {
        labelOfLoop = "loop_" + (i + 1)
        lines[i] = lines[i].replace("loop", labelOfLoop + ": loop") 
      }
      loopsStack.push({
        indent: match[1],
        label: labelOfLoop
      })
    }
    else if((match = line.match(/^(\s*)break/)) != null) {
      lines[i] = lines[i].replace("break", "break " + lastV(loopsStack).label) 
    }
    else if((match = line.match(/^(\s*)\}/)) != null) {
      if(loopsStack.length > 0 && lastV(loopsStack).indent == match[1]) {
        loopsStack.pop()
      }
    }
  }
  return lines.join("\n")
}

exports.lastV = function(vs) {
  return vs[vs.length - 1]
}
exports.matchString = function(s, re, p) {
  if(re.global) {
    re = RegExp(re.source, ((re.ignoreCase) ? "i" : "") + ((re.multiline) ? "m" : ""))
  }
  var match = s.slice(p).match(re)
  if(match != null) {
    match.index += p
  }
  return match
}

exports.transformMatch = function(s) { 
  s = "\n" + s
  var log = noLog
  var match = { index: 0 }
  while((match = matchString(s, /(\n\s*)(when|refine)\(/, match.index)) != null) {
    var whenExprBegin = match.index + match[1].length + match[2].length
    var whenExprEnd = matchCloseBracket(s, whenExprBegin)
    //# without parens
    var whenExpr = s.slice(whenExprBegin + 1, whenExprEnd - 1).trim()
    var whenIndent = match[1]
    log(whenIndent.length)
    var whenBegin = whenExprBegin - match[2].length
    var whenEnd = matchString(s, RegExp(whenIndent + "\\}"), whenBegin).index
    s = (s.slice(0, whenBegin)
      + "with({ $: " + whenExpr + ", __proto__: null }) switch(yes) {" 
      + (s.slice(s.indexOf("\n", whenExprEnd), whenEnd)
        .replace(RegExp(whenIndent + "  \\}", "g"), whenIndent + "  } break")
        .replace(RegExp(whenIndent + "  else", "g"), whenIndent + "  default:")
        .replace(RegExp(whenIndent + "  is\\((.*?)\\)", "g"), function(all, typeNames) {
          return (whenIndent + "  case("
            + (typeNames.trim().split(/\s*\|\s*/)
              .map(function(type) {
                return "$ instanceof " + type
              })
              .join(" || ")
            )
            + "):"
          )  
        })
      )
      + s.slice(whenEnd)
    )
    //log(s)
  }
  return s.slice(1)
}

exports.fixElse = function(s) {
  return s.replace(/([^;\s])([ ]+?)else/g, '$1;$2else')
}

exports.transformNumbers = function(subst, s) { 
  return s.replace(
    /([\(\[\-!\s])(0b[01][01_]*|0x[\da-fA-F][\da-fA-F_]*|\d[\d_]*(?:\.\d[\d_]*)?(?:[eE]\-?\d[\d_]*)?)/g, 
    function(all, prefix, num) { 
      return prefix + subst(num)    
    }
  )
}

exports.transformNumbers.debug = function(num) {
  return (
    (/^0b/.test(num) || num.indexOf('_') > -1)
      ? 'n$(`' + num + '`)'
      : num
  )
}

exports.transformNumbers.release = function(num) {
  var jsNum = num.replace(/_/g, "")
  if(/^0b/.test(jsNum)) {
    jsNum = "0x" + parseInt(jsNum.slice(2), 2).toString(16).toUpperCase()
  }
  return (
    ((jsNum != num)
      ? "/* " + num + " */ "
      : ""
    )
    + jsNum
  )    
}

exports.transformCssNumbers = function(s) { 
  return s.replace(
    /([\(\[\-!\s])(0b[01][01_]*|#[\da-fA-F][\da-fA-F_]*|\d[\d_]*(?:\.\d[\d_]*)?(?:[eE]\-?\d[\d_]*)?)/g, 
    function(all, prefix, num) { 
      var jsNum = num.replace(/_/g, "")
      if(/^0b/.test(jsNum)) {
        jsNum = "#" + parseInt(jsNum.slice(2), 2).toString(16).toUpperCase()
      }
      return prefix + (
        ((jsNum != num)
          ? "/* " + num + " */ "
          : ""
        )
        + jsNum
      )    
    }
  )
}

exports.fixAsi = function(s) {
  /* 
    asi fix based on indent
    add ; to
    {
      expr
      [1, 2] // array, not operator[]
      (foo || bar) // group operator, not call operator
    }
  */  
  return ("\n" + s).replace(
    /(\n[ ]*)([^\s]*)(\s*)(?=\1([\[\(]))/g,
    function(all, firstInd, firstLineOfCode, emptyInds, lastInd, lastLineOfCode) {
      // if {firstLineOfCode} isnt ended to ; and indent of {firstLineOfCode} more or eq indent of {lastLineOfCode} - add ;
      if(!/[;,]\s*?$/.test(firstLineOfCode) && firstInd.length >= lastInd.length)
        return firstInd + firstLineOfCode + ';' + (emptyInds || '') // + lastInd + lastLineOfCode
      else
        return all
    }
  ).slice(1)
  
  
  return s.replace(/^(\s*)([\(\[])/mg, '$1;$2')
}

//# for C like langs
exports.asi = function(defs, s) {
  //# match all assigments
  return (defs
    .reduce(function(s, def) {
      return replaceAll(s, def, function(m) {
        var pos = m.index
        var exprBegin = skipSpaces(m.input, m.input.lastIndexOf("\n", pos))
        var exprEnd = skipSpacesBack(m.input, matchExprEnd(m.input, pos + 1, /\n|;/) + 1)
        m.index = exprBegin
        var expr = m.input.slice(exprBegin, exprEnd)
        m[0] = expr
        //log(expr)
        if(expr.match(/;$/)) {
          return expr
        }
        else {
          return expr + ";"
        }
      })
    }, "\n" + s + "\n")
    .replace(/(\))(\n\s*[a-zA-Z0-9_$\}])/g, "$1;$2")
    .slice(1, -1)
  )
  
}

//# new syntax { [@[key] = value] }, comma free, call before { addBlindCommas }
exports.transformMap = function(s) {
  
}

exports.cutCssExtraParens = function(s) {
  return replaceAll(s, /(:[ ]+)\(/, function(m) {
    var exprEnd = matchCloseBracket(m.input, m.index + m[1].length)
    var ret = m[1] + m.input.slice(m.index + m[0].length, exprEnd - 1)
    m[0] = m.input.slice(m.index, exprEnd)
    return ret
  })
}

exports.transformCDefine = function(s) {
  return replaceAll(s, /\s#define[ ]/, function(m) {
    var lineEnd = m.input.indexOf("\n", m.index + 1)
    if(m.input.charAt(lineEnd - 1) != "{") {
      return m[0]
    }
    else {
      var exprEnd = matchCloseBracket(m.input, lineEnd - 1)
      var ret = (m.input.slice(m.index + 1, exprEnd)
        .replace(/\n/g, " \\\n")
      )
      m.index = m.index + 1
      m[0] = m.input.slice(m.index, exprEnd)
      return ret
    }
  })
}

exports.matchExprEnd = function(s, p, endRE) {
  var matchRE = RegExp('(' + hideRegExpGroups(endRE).source + ')|' + /([\s]function[\(\s])|([\(\{\[])/.source, 'gm')
  matchRE.lastIndex = p
  var match = []
  while((match = matchRE.exec(s)) != null) {
    var i = 0; while(++i < match.length && (match[i] || '') == '')
      ;
    var p = matchRE.lastIndex
    if(p >= s.length)
      return p
    /*
    if(i == 1 && /[\(\[]/.test(s.charAt(p - match[1].length))) {
      i = 2
    }
    */
    switch(i) {
      case 1: {
        return p - (match[0] || '').length
      }
      case 2: { // function
        //log("!" + s.slice(p - match[1].length))
        p = matchCloseBracket(s, s.indexOf('(', p - 1))
        p = matchCloseBracket(s, s.indexOf('{', p))
        //log(s.slice(p))
      } break
      case 3: {
        //log(p)
        //log(s.slice(p - match[0].length))
        //var isFnCall = /a-z0-9_$/i.test(s.charAt(p - 2)) 
        p = matchCloseBracket(s, p - match[0].length)
        //log(s.slice(p))
      } break
    }
    matchRE.lastIndex = p
  }
  return -1 >>> 0 
}


exports.matchExprBegin = function(s, p, endRE) {
  //var matchRE = RegExp('(' + endRE.source + ')|' + /([\)\}\]])/.source, 'g')
  var matchRE = RegExp(/([\)\}\]])/.source + '|(' + endRE.source + ')', 'g')
  matchRE.lastIndex = p
  var match = []
  while((match = matchLast(s, matchRE)) != null) {
    var i = 0; while(++i < match.length && (match[i] || '') == '')
      ;
    var p = matchRE.lastIndex
    if(p == 0)
      return p
    switch(i) {
      case 2: {
        return p // - (match[2] || '').length
      }
      case 1: {
        //log(p)
        p = matchOpenBracket(s, p)
        break
      }
    }
    matchRE.lastIndex = p
  }
  return -1 >>> 0 
}


exports.skipSpaces = function(s, p) {
  return p + s.slice(p).match(/\s*/)[0].length
}

exports.skipSpacesBack = function(s, p) {
  return p - s.slice(0, p).split("").reverse().join("").match(/\s*/)[0].length
}

exports.parseVar = function(s, p, out, endRE) {
  p = skipSpaces(s, p)
  var match = /^([a-zA-Z_$][a-zA-Z0-9_$]*)|\@/.exec(s.slice(p))
  if(match == null) {
    return p
  }
  /* 
  if(match == null) {
    log("!")
  }
  */
  out.name = match[0]
  p = skipSpaces(s, p + match[0].length)
  var q
  //# Type
  if(s.charAt(p) == ":") {  
    p += 1
    p = matchExprEnd(s, q = p, RegExp('(?:=|' + endRE.source + ')'))
    out.type = s.slice(q, p).trim()
  }
  p = skipSpaces(s, p)
  if(s.slice(p).match(/^=/)) {
    p += 1
    p = matchExprEnd(s, q = p, endRE)
    out.v = s.slice(q, p).trim()
  }
  return p
}

exports.transformToBlockScope = function(s) { 
  return s
  var pass = function(s, isSkip) { 
    var matchRE = RegExp(/([\(\[\s]function[\s\(])|(\{)|(\s(?:var|const)\s)/.source, 'g')
    matchRE.lastIndex = 1
    var match
    var hasVars = no
    while((match = matchRE.exec(s)) != null)
    {
      var p = matchRE.lastIndex
      var i = 0; while(++i < match.length && (match[i] || '') == '')
        ;
      switch(i) {
        case 1: { // function
          --p
          var q = matchCloseBracket(s, s.indexOf('(', p)) // skip args
          var k = s.indexOf('{', q)
          q = matchCloseBracket(s, k) // match fn's body
          var replace = pass(s.slice(k, q), yes)
          s = s.slice(0, k) + replace + s.slice(q)
          p = k + replace.length
          break
        }
        case 2: { // {
          --p
          var q = matchCloseBracket(s, p)
          var replace = pass(s.slice(p, q), no)
          s = s.slice(0, p) + replace + s.slice(q)
          p += replace.length
          break
        }
        case 3: { // var || const
          hasVars = yes
          break
        }
      }
      matchRE.lastIndex = p
    }
    if(0 && hasVars && !isSkip)
    {  
      
      return "".concat("with($S()) ", s, "")
    }
    
    return s
  }
  return pass('{' + s + '}', yes).slice(1, -1)
}

/*
  convert {expr.!foo} to {expr.not.foo)}
*/
exports.transformNot = function(s) { 
  if(0 && global.Proxy) {
    var isFixed = no
    s = s.replace(/\.!(\w)/g, function(all, name) {
      isFixed = yes
      return ".not." + name
    })
    if(isFixed) {
      s = "using(objectNotMixin); " + s
    }
    return s
    
  }
  else {
    var isFixed = no
    var matchRE = /\.!(?=[a-zA-Z])/g
    matchRE.lastIndex = 0
    var match
    while((match = matchRE.exec(s)) != null) {
      isFixed = yes
      var p = matchRE.lastIndex
      var matchMethod = s.slice(p).match(/([a-zA-Z0-9$]+)/) 
      var q = p + matchMethod[0].length
      //# method
      if(s.charAt(q) == "(") {
        q = matchCloseBracket(s, q)
      }
      s = s.slice(0, p - 1) +"not$(function(_) { return _." + s.slice(p, q) + " })" + s.slice(q)
    }
    if(isFixed) {
      s = "using(objectNot$Mixin); " + s
    }
    return s
  }
}

/*
  convert { for(var: b >>|<< e ) } to { for$([b, ">>", e], function(var) {  }) }
*/
exports.transformFor = function(subst, s) { 
  var matchRE = /for\(([a-zA-Z0-9_]+)\:\s/g
  matchRE.lastIndex = 0
  var match
  while((match = matchRE.exec(s)) != null) {
    var p = matchRE.lastIndex
    var q
    
    // var name
    var varName = match[1]
    p = matchExprEnd(s, (q = p), />>|<</)
    
    // begin
    var begin = s.slice(q, p)
    var dir = s.slice(p, (p += 2))
    p = matchExprEnd(s, (q = p), /%%|\)/)
    
    // end
    var end = s.slice(q, p)
    var step = null
    
    // step
    if(s.slice(p, p + 2) == "%%") {
      p = matchExprEnd(s, (q = p += 2), /\)/)
      step = s.slice(q, p)
    }
    
    // body
    p += 1 // )
    p = skipSpaces(s, p)
    var bodyP = p
    // p += 1 // {
    p = matchCloseBracket(s, (q = p))
    var body = s.slice(q, p)
    
    
    s = "".concat(
      s.slice(0, matchRE.lastIndex - match[0].length), 
      subst(varName, begin, end, step, dir, body), 
      s.slice(p)
    )
    
    matchRE.lastIndex = bodyP
    //return s
    
  }
  
  return s
}

exports.transformFor.debug = function(varName, begin, end, step, dir, body) {
  return "".concat(
    "for$([", 
      begin.trim(), 
      ", `", 
      dir, 
      "`, ", 
      end.trim(), 
      ((step != null) 
        ? ", `%%`, " + step.trim() 
        : ""
      ),
    "], function(", varName, ") ", body, ")"
  )
}

exports.transformFor.release = function(type, varName, begin, end, step, dir, body) {
  begin = begin.trim()
  end = end.trim()
  
  if(step == null) {
    step = "1"
  }
  step = step.trim()
  
  var realBegin = "b$";
  var realEnd = "e$ - e$ % s$"
  if(dir == "<<") {
    var tmp = realBegin; realBegin = realEnd; realEnd = tmp
    realBegin += " - s$"
    realEnd += " - s$"
    step = "".concat("-(", step, ")")
  }
  
  return "".concat(
    "for(", type, " b$ = ", begin, ", e$ = ", end, ", s$ = ", step, ", ", varName, " = ", realBegin, ", eAligined$ = ", realEnd, "; ", varName, " != eAligined$; ", varName, " ", "+= s$) ", body   
  )
}

exports.wrapExpr = function(leftRepl) {
  if(
    // whole expr is enclosed to braces
    /^[\(\[]/.test(leftRepl) && matchCloseBracket(leftRepl, 0) == leftRepl.length
    // or just varName
    || /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(leftRepl)
  ) {
    return leftRepl
  }
  else {
    return "(" + leftRepl + ")"
  }
}

/*
  convert { a \!?name b } to { a.!?name(b) }
*/
exports.transformUserOp = function(subst, s) { 
  var matchRE = /\s\\(\!?[a-zA-Z0-9_]{2,})\s/g // 2+ to skip \n \r
  matchRE.lastIndex = 0
  var match
  while((match = matchRE.exec(s)) != null) {
    var p = matchRE.lastIndex
    
    // var name
    var opName = match[1]
    var leftExprEnd = skipSpacesBack(s, p - match[0].length)
    var leftExprBegin = skipSpaces(s, matchExprBegin(s, leftExprEnd, /(\sreturn\s)|\(|\[|\{|,|\s(==|!=|>=?|<=?|=>|&&|\|\||[+\-*\/%^&|]?=)\s/))
    var rightExprBegin = skipSpaces(s, p)
    var rightExprEnd = skipSpacesBack(s, matchExprEnd(s, rightExprBegin, /\)|\]|\}|,|\s(==|!=|>=?|<=?|=>|&&|\|\||\\\!?([a-zA-Z0-9_]{2,}))\s|\n/))
    var leftRepl = wrapExpr(s.slice(leftExprBegin, leftExprEnd))
    
    s = "".concat(s.slice(0, leftExprBegin), // prev text
      subst(leftRepl, s.slice(leftExprEnd, p - match[0].length + 1), opName, s.slice(rightExprBegin, rightExprEnd)), 
      s.slice(rightExprEnd) // next text  
    )
    matchRE.lastIndex = matchRE.lastIndex + 1 // skip (
  }
  
  return s
}

exports.transformUserOp.asMethod = function(left, gap, op, right) {
  return "".concat(left, gap, ".", op, "(", right, ")")
}
exports.transformUserOp.asFn = function(left, gap, op, right) {
  return "".concat(op, "(", left, ", ", gap, right, ")")
}

exports.hideRegExpGroups = function(re) {
  return RegExp(re.source
    .replace(/(\\.)/g, "$1\uFFFF")
    .replace(/\((?!\uFFFF|\?)/g, "(?:")
    .replace(/\uFFFF/g, "")
  )
}

/*
  convert { a => b } to { a ? b : yes }
*/
exports.transformImplication = function(s) { 
  var matchRE = /\s\=>\s/g // 2+ to skip \n \r
  matchRE.lastIndex = 0
  var match
  while((match = matchRE.exec(s)) != null) {
    var p = matchRE.lastIndex
    
    // var name
    var leftExprEnd = skipSpacesBack(s, p - match[0].length)
    var leftExprBegin = skipSpaces(s, matchExprBegin(s, leftExprEnd, /(\sreturn\s)|\(|\[|\{|,|\s([+\-*\/%^&|]?=)\s/))
    var rightExprBegin = skipSpaces(s, p)
    var rightExprEnd = skipSpacesBack(s, matchExprEnd(s, rightExprBegin, /\)|\]|\}|,|\s(\=>)\s|\n/))
    var leftRepl = wrapExpr(s.slice(leftExprBegin, leftExprEnd))
    
    s = "".concat(s.slice(0, leftExprBegin), // prev text
      leftRepl, s.slice(leftExprEnd, p - match[0].length), " ? /*jb=> */ ", s.slice(rightExprBegin, rightExprEnd), " : yes", 
      s.slice(rightExprEnd) // next text  
    )
    matchRE.lastIndex = matchRE.lastIndex + 1 // skip (
  }
  
  //# fix space
  return s.replace(/\/\*jb=> \*\//g, "/* => */")
}

/*
  convert { a ** b } to { a.pow(b) }
*/
exports.transformPowOp = function(fnName, lib, s) { 
  var isFixed = no
  var matchRE = /\s\*\*\s/g 
  matchRE.lastIndex = 0
  var match
  while((match = matchRE.exec(s)) != null) {
    isFixed = yes
    var p = matchRE.lastIndex
    
    // var name
    var leftExprEnd = skipSpacesBack(s, p - match[0].length)
    var leftExprBegin = matchExprBegin(s, leftExprEnd, /(\sreturn\s)|\(|\[\|{|,|\s(==|!=|>=?|<=?|&&|\|\||[+\-*\/%^&|]?=|[+\-*\/%^&|]|\\\!?[a-zA-Z0-9_]{2,})\s/)
    var rightExprBegin = skipSpaces(s, p)
    var rightExprEnd = skipSpacesBack(s, matchExprEnd(s, rightExprBegin, /\)|\]|\}|,|\s(==|!=|>=?|<=?|&&|\|\||[+\-*\/%^&|]|\\\!?[a-zA-Z0-9_]{2,})\s|\n/))
    var leftRepl = wrapExpr(s.slice(leftExprBegin, leftExprEnd))
    
    if(/^\d+/.test(leftRepl)) { // for pow number should be wrapped
      leftRepl = "".concat("(", leftRepl, ")")
    }
    
    if(fnName.match(/^\./)) {
      s = "".concat(s.slice(0, leftExprBegin), // prev text
        leftRepl, s.slice(leftExprEnd, p - match[0].length), fnName, "(", s.slice(rightExprBegin, rightExprEnd), ")", 
        s.slice(rightExprEnd) // next text  
      )
    }
    else {
      s = "".concat(s.slice(0, leftExprBegin), // prev text
        fnName, "(", leftRepl, ", ", s.slice(leftExprEnd, p - match[0].length), s.slice(rightExprBegin, rightExprEnd), ")", 
        s.slice(rightExprEnd) // next text  
      )
    }
    matchRE.lastIndex = matchRE.lastIndex + 1 // skip (
  }
  if(isFixed) {
    s = lib + s
  }
  return s
}

/*
  mod always -> positive number
  convert { a % b } to { a.mod(b) }
*/
exports.fixModOp = function(fnName, lib, s) { 
  var isFixed = no
  var matchRE = /\s%\s/g 
  matchRE.lastIndex = 0
  var match
  while((match = matchRE.exec(s)) != null) {
    isFixed = yes
    var p = matchRE.lastIndex
    
    // var name
    var leftExprEnd = skipSpacesBack(s, p - match[0].length)
    var leftExprBegin = matchExprBegin(s, leftExprEnd, /(\sreturn\s)|\(|\[\|{|,|\s(==|!=|>=?|<=?|&&|\|\||[+\-^&|]?=|[+\-^&|]|\\\!?[a-zA-Z0-9_]{2,})\s/)
    var rightExprBegin = skipSpaces(s, p)
    var rightExprEnd = skipSpacesBack(s, matchExprEnd(s, rightExprBegin, /\)|\]|\}|,|\s(==|!=|>=?|<=?|&&|\|\||[+\-^&|]|\\\!?[a-zA-Z0-9_]{2,})\s|\n/))
    var leftRepl = wrapExpr(s.slice(leftExprBegin, leftExprEnd))
    
    if(/^\d+/.test(leftRepl)) { // for pow number should be wrapped
      leftRepl = "".concat("(", leftRepl, ")")
    }
    
    if(fnName.match(/^\./)) {
      s = "".concat(s.slice(0, leftExprBegin), // prev text
        leftRepl, s.slice(leftExprEnd, p - match[0].length), fnName, "(", s.slice(rightExprBegin, rightExprEnd), ")", 
        s.slice(rightExprEnd) // next text  
      )
    }
    else {
      s = "".concat(s.slice(0, leftExprBegin), // prev text
        fnName, "(", leftRepl, ", ", s.slice(leftExprEnd, p - match[0].length), s.slice(rightExprBegin, rightExprEnd), ")", 
        s.slice(rightExprEnd) // next text  
      )
    }

    matchRE.lastIndex = matchRE.lastIndex + 1 // skip (
  }
  if(isFixed) {
    s = lib + s
  }
  return s
}

/*
  convert { a <=? b ... } to { cmp$(a, "<=", b, ...) }
*/
exports.transformLinearComparsion = function(subst, s) { 
  //s += " "
  var matchRE = /\s([><]=?|==)\s/g 
  matchRE.lastIndex = 0
  var match
  while((match = matchRE.exec(s)) != null) {
    var p = matchRE.lastIndex
    
    var opName = match[1]
    var leftExprEnd = skipSpacesBack(s, p - match[0].length)
    // try {
      var leftExprBegin = skipSpaces(s, matchExprBegin(s, leftExprEnd, /(\sreturn\s)|\(|\[|\{|,|\s(&&|\|\||[+\-*\/%^&|]?=)\s/))
    // }
    // catch(err) {
    //   log(s.slice(p, p + 20))
    // }
    var leftRepl = wrapExpr(s.slice(leftExprBegin, leftExprEnd))
    var out = [
      leftRepl, 
      { gap: s.slice(leftExprEnd, skipSpaces(s, p - match[0].length)), op: opName }
    ]
    
    for(;;) {
      //log("p", p)
      var re = /\)|\]|\}|,|\n|\s((==|>=?|<=?)|!=|&&|\|\|)\s/
      var nextExprBegin = skipSpaces(s, p)
      //  log(nextExprBegin)
      var nextExprEnd = matchExprEnd(s, nextExprBegin, re)
      var nextExprEndTrimmed = skipSpacesBack(s, nextExprEnd)
      var nextExpr = wrapExpr(s.slice(nextExprBegin, nextExprEndTrimmed))
      var opMatch = s.slice(nextExprEnd).match(re)
      //log("opMatch", opMatch)
      //log(nextExprEnd, nextExprEndTrimmed, s.slice(nextExprEnd - 2, nextExprEnd + 10))
      out.push(nextExpr) 
      
      // is op that allow continue?
      if(opMatch != null && opMatch[2]) {
        p = nextExprEnd + opMatch[0].length
        out.push({ gap: s.slice(nextExprEndTrimmed, skipSpaces(s, nextExprEnd)), op: opMatch[2] })
      }
      else {
        p = nextExprEndTrimmed
        break
      }
    }
    
    //log(out)
    if(out.length > 3) {
      s = "".concat(s.slice(0, leftExprBegin), // prev text
        subst(out), 
        s.slice(p) // next text  
      )
    }
    //return s
    matchRE.lastIndex = matchRE.lastIndex + 1 // skip (
  }
  
  return s
}

exports.transformLinearComparsion.debugDynamic = function(out) {
  return "".concat(
    "cmp$(", 
    (out
      .map(function(v) {
        if(Object(v) instanceof String) {
          return v
        }
        else {
          return "".concat(v.gap, "`", v.op, "`") 
        }
      })
      .join(", ")
    ),
    ")" 
  )
}

exports.transformLinearComparsion.release = function(out) {
  log(out)
  var expr = ""
  for(var i = 0; i < out.length - 1; i += 2) {
    expr += "".concat(out[i + 0], out[i + 1].gap, out[i + 1].op, " ", out[i + 2],  " && ") 
  }
  
  return expr.slice(0, -4)
}


/*
  convert { a <-> b } to { with({ temp$: "<->", __proto__: null }) temp$ = a, a = b, b = temp$ }
*/
exports.transformSwapOp = function(type, s) { 
  var matchRE = /\s<->\s/g 
  matchRE.lastIndex = 0
  var match
  while((match = matchRE.exec(s)) != null) {
    var p = matchRE.lastIndex
    
    // var name
    var leftExprEnd = skipSpacesBack(s, p - match[0].length)
    var leftExprBegin = skipSpaces(s, matchExprBegin(s, leftExprEnd, /\n/))
    var rightExprBegin = skipSpaces(s, p)
    var rightExprEnd = skipSpacesBack(s, matchExprEnd(s, rightExprBegin, /\n/))
    var a = s.slice(leftExprBegin, leftExprEnd)
    var b = s.slice(rightExprBegin, rightExprEnd)
    
    s = "".concat(s.slice(0, leftExprBegin), // prev text
      type, " temp$ = ", a, "; ", a, " = ", b, "; ", b, " = temp$", 
      s.slice(rightExprEnd) // next text  
    )
    matchRE.lastIndex = matchRE.lastIndex + 1 // skip space
  }
  
  return s
}

exports.addDebugInfo = function(fileName, s) {
  var encodedFileName = (fileName
    .replace(/[\\\/]/g, '$')
    .replace(/\.|[^a-zA-Z\d_$]/g, '_')
    .replace(/^(\d)/g, '_$1')
  )
  return s.replace(/([\s\(\[]function)\(/g, function(all, f, pos) {
    var fHeader = s.slice(pos, s.indexOf("\n", pos))
    var isCheckP = fHeader.indexOf(" var p ") != -1
    var maxArity
    if(fHeader.indexOf("[].slice.call(arguments, 0)") == -1) {
      var argsString = fHeader.match(/function\((.*?)\)/)[1]
      if(argsString == "") {
        maxArity = 0
      }
      else {
        maxArity = argsString.split(/,/).length
      }
    }
    else {
      maxArity = +Infinity
    }
    
    var minArity
    if(isFinite(maxArity)) {
      minArity = maxArity - (fHeader.split(/if\(.*? == null\) /).length - 1) 
    }
    else {
      minArity = 0
    }
    var arityInfo = "_" + [
      (isCheckP) ? "p" : "", 
      minArity, 
      (isFinite(maxArity)) ? maxArity : "inf"
    ].join("_") 
    return f + " " + encodedFileName + "_L" + (linesCount(s.slice(0, pos))) + arityInfo + "(" 
  })
}

//# IE8- issue
var isNullCallerInEval = (function() { 
  return eval("(function() { return arguments.callee.caller })()") == null
})()

exports.addFnLinking = function(s) {
  var matchRE = /([\s\(\[]function\([\s\S]*?\)\s+\{)/g
  var isFixed = no
  matchRE.lastIndex = 0
  var match
  while(match = matchRE.exec(s)) {
    isFixed = yes
    var p = match.index + 1
    var q = matchCloseBracket(s, matchRE.lastIndex - 1)
    s = s.slice(0, p) + "f$(" + s.slice(p, q) + ")" + s.slice(q)
    matchRE.lastIndex += 11
  }
  if(isFixed) {
    //s = "usingOrInstall(fnLinkMixin); " + s
  }
  if(isNullCallerInEval) {
    s = replaceAll(s, /[\s\(\[!~+]eval\(/, function(m) {
      var exprBegin = m.index + m[0].length - 1
      var exprEnd = matchCloseBracket(m.input, exprBegin)
      m[0] = m.input.slice(m.index, exprEnd)
      return m[0].charAt(0) + "f$(eval(`[function __0_0() { return (` + " + m.input.slice(exprBegin, exprEnd) + " + `) }]`)[0])()"
    })
  }
  return s
}

exports.addDebugInfoToEval = function(s) {
  var matchRE = /([\s\(\[]eval\()/g
  matchRE.lastIndex = 0
  var match
  while(match = matchRE.exec(s)) {
    var p = match.index + 1
    var q = matchCloseBracket(s, matchRE.lastIndex - 1)
    var arg = s.slice(p + 5, q - 1)
    if(arg == "s$") {
      continue
    }
    var replacement = "eval$(" + arg + ", " + linesCount(s.slice(0, p)) + ", function(s$) { return eval(s$) })"
    s = s.slice(0, p) + replacement + s.slice(q)
  }
  return s
}

exports.replace = function(re, to) {
  return function(s) {
    return (" " + s).replace(re, to).slice(1)
  }
}

exports.fixInstanceOf = function(s) {
  var isFixed = no
  s = s.replace(/\s+instanceof\s/g, function(all) {
    isFixed = yes
    return '.toObject()' + all
  }) 
  if(isFixed) {
    s = "using(objectToObjectMixin); " + s
  }
  return s
}

exports.fixNew = function(s) {
  isFixed = no
  s = s.replace(/\.new\(/g, function(all) {
    isFixed = yes
    return'.new$('
  })
  if(isFixed) {
    s = "using(rubyNewSyntaxMixin); " + s
  }
  return s
}

/*
if(foo) {
  
}
> var foo = (1
  + 2
)
> var bar = 3
else if(foo + bar == 3) {
  
}

{ var foo, bar } if(foo) {
  
}
else if( /* > _/ foo = (1
  + 2
), 
/* > _/ bar = 3, 
/* else if _/ foo + bar == 3) {
  
}
*/
exports.transformVarInjection = function(s) {
  var log = noLog 
  return replaceAll("\n" + s, /(\n[ ]*)>[ ]+([a-zA-Z0-9_$]+)\s+/, function(m) {
    //# lookup top { if }
    var ifPos = matchLast(m.input, RegExp(m[1] + /if\(/.source, "g"), m.index).index + m[1].length
    log(ifPos)
    var elseIfMatch = m.input.match(RegExp(m[1] + /else\s+if\(/.source), m.index)
    //# get var name
    var vars = (m.input.slice(m.index + m[1].length + 1, elseIfMatch.index)
      .split(m[1] + "> ")
    )
    log("!" + m.input.slice(m.index + m[1].length + 1, elseIfMatch.index) + "!")
    //# extend selection
    log(getLastPos(elseIfMatch) - ifPos)
    m[0] = m.input.slice(ifPos, getLastPos(elseIfMatch))
    m._index = m.index
    m.index = ifPos
    log("%" + m.input.slice(getLastPos(m)))
    //# preallocate all vars before { if }
    return (("{ var " 
        + (vars
          .map(function(varExpr) {
            log("?" + varExpr + "!")
            return varExpr.match(/^\s*var\s+([\w_$]+)/)[1]
          })
          .join(", ")
        )  
        + " } "
      )
      + m.input.slice(ifPos, m._index) + elseIfMatch[0]
      //# put var exprs w/o { var }, separated by comma op
      + (vars
        .map(function(varExpr) {
          return "/* > */" + varExpr.match(/^\s*var(\s+[\w_$]+[\s\S]+)$/)[1]
        })
        .join("," + m[1])
      )
      + "," + m[1] + "/* else if */ "
    )
  }).slice(1)
}

exports.transformVarInjectionStatic = function(s) {
  //var log = noLog 
  return replaceAll("\n" + s, /(\n[ ]*)>[ ]+([a-zA-Z0-9_$]+)\s+/, function(m) {
    //debugger
    var elseIfMatch = m.input.match(RegExp(m[1] + /(else\s+)if\(/.source), m.index)
    var elseEndPos = matchCloseBracket(m.input, getLastPos(m.input.match(RegExp(m[1] + /else[ ]+\{/.source, ""), m.index)) - 1)
    //# get var name
    var vars = (m.input.slice(m.index + m[1].length + 2, elseIfMatch.index)
      .split(m[1] + "> ")
    )
    //# extend selection
    m[0] = m.input.slice(m.index, elseEndPos)
    
    log("!" + vars[0])
    return "".concat(
      m[1], "else {", 
      (vars
        .map(function(varExpr) {
          return "/* > */ " + varExpr
        })
        .join(m[1])
      ),
      m[1], "/* else */\x00 ", m.input.slice(elseIfMatch.index + m[1].length + elseIfMatch[1].length, elseEndPos), "}"
    )
  }).slice(1)
}

exports.transformAnonymousPatch = function(s) {
  return replaceAll(s, /([ \(\[+\-!])\{\n/, function(m) {
    //# binary op or indented
    if(m[1] == " " && m.input.slice(0, m.index).match(/(\s[+\-\*\/=&\|%\^\?:]?|throw|export)$/) == null 
      //# or hash
      || m.input.match(/^[ ]*[a-zA-Z0-9_$]+\:/, getLastPos(m))
    ) {
      return m[0]
    }
    else {
      var exprEnd = skipSpacesBack(m.input, matchCloseBracket(m.input, m.index + 1))
      var ret = "".concat(m[1], "(#() ", skipPoint, m.input.slice(m.index + 1, exprEnd), ")()")
      m[0] = m.input.slice(m.index, exprEnd)
      return ret
    }
  })
}

exports.transformCompileFnBody = function(s) {
  return replaceAll(s, /(\)[ ]+)(\{\n[ ]*)compile[ ]/, function(m) {
    var fnEnd = skipSpacesBack(m.input, matchCloseBracket(m.input, m.index + m[1].length))
    var exprBegin = skipSpaces(m.input, getLastPos(m))
    var exprEnd = skipSpacesBack(m.input, fnEnd - 1)
    var expr = m.input.slice(exprBegin, exprEnd)
    var ret = "".concat(m[1], m[2], m.input.slice(getLastPos(m), exprBegin), "eval(arguments.callee.ast$ || (arguments.callee.ast$ = ", expr, "))", m.input.slice(exprEnd, fnEnd))
    m[0] = m.input.slice(m.index, fnEnd)
    return ret
  })
}

//# { strip { foo } } -> { /* strip { */ foo /* } */ }. For C macro
exports.stripBlocks = function(s) {
  return replaceAll(s, /([\s])(strip[ ]+\{)/, function(m) {
    var bodyStart = getLastPos(m)
    var bodyEnd = matchCloseBracket(m.input, bodyStart - 1) - 1
    var body = m.input.slice(bodyStart, bodyEnd)
    var ret = "".concat(m[1], "/* ", m[2], " */", body, "/* } */")
    m[0] = m.input.slice(m.index, bodyEnd + 1)
    return ret
  })
}

/*
exports.constFold = function(s) {
  s = " " + s + " "
  var ops = "** * / % + - >> << >>> & ^ |".split(/\s+/)
  var barrier = ";"
  s = (s
    .replace(/0x(\d+)/g, function(all, num) {
      return parseInt(num, 16)
    })
  )
  var tempVars = {  }
  var tempVarNextId = 0
  var makeTempVar = function(expr) {
    return "".concat("cf", tempVarNextId++, "$")
  }
  for(;;) {
    var oldS = s
    s = (s
      .replace(/\(\s*(-?\d+(?:\.\d+)?(?:[eE]-?\d+)?)\s*\)/g, "$1")
      .replace(/~(-?\d+(?:\.\d+)?(?:[eE]-?\d+)?)/g, function(all, num) {
        return ~(+num)
      })
    )  
    //# according op priority, from top to low
    ops.forEach(function(op) {
      //# 
      s = replaceAll(s, RegExp("".concat(/(-?\d+(?:\.\d+)?(?:[eE]-?\d+)?|([a-zA-Z_$][a-zA-Z0-9_$]*))\s+/.source, "(", escapeForRegExp(op), /(?:\s+(-?\d+(?:\.\d+)?(?:[eE]-?\d+)?|([a-zA-Z_$][a-zA-Z0-9_$]*)))/.source, ")+")), function(m) {
        
      })
      s = s.replace(, function(all, a, aVar, b, bVar, isBarrired) {
        if(aVar != null || bVar != null) {
          if(isBarrired == null) {
            return "".concat("(", all, ")")
          }
          else {
            return all
          }
        }
        else {
          if(op == "**") {
            return Math.pow(+a, +b)
          }
          else {
            log(all, isBarrired, aVar, bVar, isBarrired == null && (aVar != null || bVar != null))
            return eval(a + " " + op + " " + b)
          }
        }
      })
    })
    if(oldS == s) {
      break
    }
  }
  //s = s.replace(RegExp(escapeForRegExp(barrier), "g"), "")
  return s.slice(1, -1)
}
*/

//# subst const's expressions in case that used only once, remove if value dont needed 
//# should be called before s/fix/var/ or something
//# assumes that you dont have same const name in nested scope (good style)
/*
  fix a = 1
  fix b = a
  fix d = x
  fix c = 2 + b + d + d
  fix sub = function() {
    fix c = 12
    return c + d
  }
  return sub(sin(c))
*/
exports.reduceConsts = function(s) {
  var log = noLog
  var transformScope = function(s) {
    //# for each fn or const
    return replaceAll(s, /([\s\(\[]function\(.*?\)\s+\{)|(\n[ ]*fix[ ]([a-zA-Z_$][a-zA-Z0-9_$]*)[ ]+=)/, function(m) {
      //# nested function
      if(m[1]) {
        var fnEnd = matchCloseBracket(m.input, getLastPos(m) - 1)
        log("!", m.input.slice(fnEnd - 1, fnEnd + 10))
        var r$ = m[1] + skipPoint + transformScope(m.input.slice(getLastPos(m), fnEnd))
        m[0] = m.input.slice(m.index, fnEnd)
        return r$
      }
      else {
        var constName = m[3]
        log(constName)
        //? check that it do not includes eol
        var vEnd = matchExprEnd(m.input, getLastPos(m), /\n/)
        var v = m.input.slice(skipSpaces(m.input, getLastPos(m)), skipSpacesBack(m.input, vEnd))
        log(v)
        var rest = m.input.slice(vEnd)
        var parts = (function() {
          var $r = []
          var re = RegExp("".concat(/([\s+\-!\[\(])/.source, escapeForRegExp(constName), /(?=[\s\(\)\]])/.source))
          var pos = 0
          for(;;) {
            var m = rest.match(re, pos)
            if(m != null) {
              $r.push(rest.slice(pos, m.index + m[1].length))
            }
            else {
              $r.push(rest.slice(pos))
              break
            }
            pos = getLastPos(m)
          }
          return $r
        })()
        log(parts)
        //# const is not used
        if(parts.length == 1) {
          //# cut it
          m[0] = m.input.slice(m.index, vEnd)
          return ""
        }
        //# const used only once or its just alias of other const (we dont check that reffered is really const)
        else if(parts.length == 2 || v.match(/^[a-zA-Z_$][a-zA-Z0-9_$]*$/)) {
          v = wrapExpr(v)
          log(parts.join(v))
          //# subst it
          m[0] = m.input.slice(m.index, m.input.length)
          return skipPoint + parts.join(v)
        }
        else {
          return m[0]
        }
      }
    })
  }
  
  return transformScope("\n" + s + "\n").slice(1, -1)
}

exports.transformCase = function(s) {
  return replaceAll("\n" + s + "\n", /(\n[ ]*)case\(/, function(m) {
    var line = m.input.slice(m.index, m.input.indexOf("\n", m.index + 1))
    //# { case } is part of js's { switch }. Back compatibility 
    if(line.indexOf("):") != -1) {
      //# do nothing
      return m[0]
    }
    else {
      var indent = m[1]
      var caseEnd = m.input.indexOf(indent + "else ", m.index)
      var replacement = indent + "if" + skipPoint + m.input.slice(m.index + m[0].length - 1, caseEnd).replace(RegExp(indent + /case\(/.source, "g"), indent + "else if(")
      m[0] = m.input.slice(m.index, caseEnd)
      return replacement
    }
  }).slice(1, -1)
}

/*
branch {
  with my romanNumeralMatch = s.match(/^[ivxlcdmk]+$/i)
  case(romanNumeralMatch != null) {

  }
  with my arabicNumeralMatch = s.match(/^([0_]+|(?<beforeDot>.)(\k<beforeDot>|[_])*)\.([0_]+|(?<afterDot>.)(\k<afterDot>|[_])*)$/)
  case(arabicNumeralMatch != null) {
    
  }
  else {
    userInputError("Unknown number format")
  }
}

/_* branch *_/; for(;;) { 
  var romanNumeralMatch = s.match(/^[ivxlcdmk]+$/i)
  if(romanNumeralMatch != null) {
    
  break } 
  var arabicNumeralMatch = s.match(/^([0_]+|(?<beforeDot>.)(\k<beforeDot>|[_])*)\.([0_]+|(?<afterDot>.)(\k<afterDot>|[_])*)$/)
  if(arabicNumeralMatch != null) {
    
  break }
  /_* else *_/; {
    userInputError("Unknown number format")
  break }
}

*/
exports.transformBranchCase = function(s) {
  return replaceAll("\n" + s + "\n", /(\n[ ]*)branch[ ]+\{/, function(m) {
    var indent = m[1]
    var branchEndPos = matchCloseBracket(m.input, getLastPos(m) - 1)
    log(branchEndPos, m.input.length)
    var $r = (
      indent + "/* branch */; for(;;) {" 
      + skipPoint 
      + replaceAll(m.input.slice(getLastPos(m), branchEndPos), RegExp("".concat("".concat("(", indent, "  ", ")"), "(case|with[ ]|\\}|else)")), function(caseOrWithMatch) {
        if(caseOrWithMatch[2] == "case") {
          return caseOrWithMatch[1] + "if"
        }
        else if(caseOrWithMatch[2] == "with ") {
          return caseOrWithMatch[1] + ""
        }
        else if(caseOrWithMatch[2] == "}") {
          return caseOrWithMatch[1] + "break }"
        }
        else if(caseOrWithMatch[2] == "else") {
          return caseOrWithMatch[1] + "/* else */;"
        }
        else {
          log(caseOrWithMatch[2])
          throw error()
        }
     })
    )
    m[0] = m.input.slice(m.index, branchEndPos)
    return $r
  }).slice(1, -1)
}


//# C compatible preprocessor w/o { __LINE__ }. Support { ID } that is unique call id of macro, which is used to make unique symbol' name postfix. Handles both escaped (\ + eol) and expr based macroses. 
exports.expandCDefines = function(s) {
  //var log = noLog
  var matchBody = function(s, p) {
    log(s.slice(p, p + 10))
    //# c escaped macro 
    if(s.match(/^.*\\\n/, p)) {
      log("?")
      //# eol excluded
      return s.match(/[^\\]\n/, p).index + 1
    }
    //# expr based
    else {
      return matchExprEnd(s, skipSpaces(s, p), /\n/)
    }
  }
  var unEscapeBody = function(s) {
    if(s.match(/^.*\\\n/)) {
      return s.replace(/\\\n/g, "\n")
    }
    else {
      return s
    }
  }
  var transformConcat = function(s) {
    log("!" + s)
    return s.replace(/\s+##\s+/g, "")
  }
  var nextId = 0
  return transformConcat(replaceAllBackward("\n" + s + "\n", /\n[ ]*#define[ ]+([a-zA-Z0-9_$]+)/, function(m) {
    var $r = null
    var macroName = m[1]
    log(macroName)
    var argsEnd = null
    var args = null
    var isFn = no
    //# macro w/ args
    if(m.input.match(/^\(/, getLastPos(m))) {
      isFn = yes
      argsEnd = matchCloseBracket(m.input, getLastPos(m))
      args = m.input.slice(getLastPos(m) + 1, argsEnd - 1).trim().split(/\s*,\s*/)
    }
    else {
      argsEnd = skipSpaces(m.input, getLastPos(m))
      args = []
    }
    var bodyEnd = matchBody(m.input, argsEnd)
    var body = unEscapeBody(m.input.slice(skipSpaces(m.input, argsEnd), skipSpacesBack(m.input, bodyEnd)))
    log("!" + body)
    var rest = m.input.slice(bodyEnd)
    var substArgs = function(s, args, vs) {
      return (" " + s + " ").replace(RegExp("".concat(/([\s+\-!~\(\[])/.source, "(", args.map(escapeForRegExp).join("|"), ")", /(?=[\s\,;\(\)\[\]])/.source), "g"), function(all, prefix, argName) {
        log(argName)
        return prefix + vs[args.indexOf(argName)]
      }).slice(1, -1)
    }
    if(isFn) {
      $r = replaceAll(rest, RegExp("".concat(/([\s+\-!\(\[])/.source, escapeForRegExp(macroName), /\(/.source)), function(m) {
        //# match all passed args
        var pos = getLastPos(m)
        var vs = (function() {
          var $r = []
          for(;;) {
            var q = matchExprEnd(m.input, pos, /[,\)]/)
            $r.push(m.input.slice(pos, q))
            pos = q + 1
            if(m.input.charAt(q) == ")") {
              break
            }
          }
          return $r
        })()
        var exprEnd = pos
        assert(args.length == vs.length, "".concat("Macro ", macroName, " arity mismatch - given ", vs.length, " should be ", args.length))
        m[0] = m.input.slice(m.index, exprEnd)
        vs = vs.map(function(v) {
          return v.replace(/^[ ]*|[ ]*$/g, "")
        })
        return m[1] + substArgs(body, args.concat("ID"), vs.concat([nextId++]))
      })
    }  
    else {
      $r = replaceAll(rest, RegExp("".concat(/([\s+\-!\(\[])/.source, escapeForRegExp(macroName), /(?=[\s\,;\(\)\[\]])/.source)), function(m) {
        //# match all passed args
        var pos = getLastPos(m)
        var exprEnd = pos
        m[0] = m.input.slice(m.index, exprEnd)
        return m[1] + substArgs(body, ["ID"], [nextId++])
      })
    }
    m[0] = m.input.slice(m.index, m.input.length)
    return skipPoint + $r
  }).slice(1, -1))
}

exports.dumpResult = function(s) {
  document.all.out.value = s
  return s 
}

exports.jsTransformers = [
  replace(/\.super([\s\(\)\[\]\.,:])/g, "[`super`]$1"), 
  transformAnonymousPatch, 
  transformCompileFnBody, 
  transformFns, 
  replace(/(\s)fix(\s)/g, (IS_SUPPORT_CONST) ? "$1const$2" : "$1var$2"),
  bindBreaksToLoops, 
  transformBranchCase, 
  replace(/(\s)loop(\s)/g, '$1for(;;)$2'),
  expandAbbrs,
  transformExport,
  //# doc comment,
  //? replace(/(\n[ ]*?)#[ ]/g, '$1//# '), 
  //# temp comment,
  //? replace(/(\n[ ]*?)\?[ ]/g, '$1//? '),
  transformMatch,
  replace(/(\s)->(\s)/g, function(all, m1, m2) {
    if(m2 == "\n") {
      return m1 + '$r = undefined' + m2
    }
    else {
      return m1 + '$r =' + m2
    }
  }),
  curry(transformNumbers, [transformNumbers.debug]),
  transformWith,
  replace(/([\s+\-!\(\[])\$([\s\(\)\[\]\.,:])/g, "$1$$r$2"), 
  transformImplication,
  curry(transformUserOp, [transformUserOp.asMethod]),
  curry(transformPowOp, [".pow", "using(numberPowMixin); "]),
  transformVarInjection, 
  curry(transformLinearComparsion, [transformLinearComparsion.debugDynamic]),
  curry(transformSwapOp, ["var"]),
  transformSelf,
  transformF,
  transformNot,
  fixElse,
  transformToBlockScope,
  curry(transformFor, [transformFor.debug]),
  //transformFns,
  addBlindCommas,
  fixAsi,
  fixInstanceOf, 
  //replace(/(\s)bind\(\{[ ]*/g, '$1with({ __proto__: null, '), 
  fixNew
]

}

}).call(this)
