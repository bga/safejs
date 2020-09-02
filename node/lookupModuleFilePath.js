var Fs = require("fs")
var Path = require('path')

var findInArray = function(vs, isMatch) {
  var i = 0
  loop_7: for(;;) {
    if(i >= vs.length) {
      break loop_7
    }
    if(isMatch(vs[i])) {
      break loop_7
    }
    i += 1
  }
  if(i >= vs.length) {
    return null
  }
  else {
    return i
  }
}

//var log = console.log.bind(console)
var log = function() {  }
exports._ = function(root, ver, className) {
  log(root, className)
  var wideLookup = function(path) {
    var all = Fs.readdirSync(path)
    var files = all.filter(function(v) {
      return Fs.statSync(path.concat(v)).isFile()
    })
    var fileKey = findInArray(files, function(v) {
      return Path.basename(v, Path.extname(v)) == className
    })
    
    if(fileKey != null) {
      return path.concat(files[fileKey])
    }
    else {
      var dirs = all.filter(function(v) {
        return v.indexOf(".") == -1 && Fs.statSync(path.concat(v)).isDirectory()
      })
      return dirs.reduce(function(ret, v) {
        return ret || wideLookup((path.concat(v)).concat("".concat("/")))
      }, null)
    }
  }
  return wideLookup(root)
}
