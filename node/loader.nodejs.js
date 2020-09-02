(function(Global)
{
  // node's bug
  if(Global.Object == null) {
    Global = (function(){ return this })() || (1, eval)('this')
  }

  Global.require = require
  // redirect console to stderr
  var log = function() {
    process.stderr.write([].join.call(arguments, ", ") + "\n")
  } 
  
  var fs = require('fs')
  var loadFile = function(url) {
    url = toNativePath(url)
    try {
      //console.log(url, fs.readFileSync(url).length)
      return fs.readFileSync(url, 'utf8')
    }
    catch(err) {
      return null
    }
  }
  
  var Vm = require("vm")
  var execScript = function(s, url, imports) {
    var names = []
    var vs = []
    for(var i in imports) {
      if(imports.hasOwnProperty(i)) {
        names.push(i)
        vs.push(imports[i])
      }
    }
    return Vm.runInThisContext("(function(" + names + "){ " + s + " })", url).apply(Global, vs)
  }
  
  var lookupModuleFilePath = function(root, ver, className) {
    var path = require(__dirname + "/lookupModuleFilePath.js")._(toNativePath(root), ver, className)
    if(path !=  null) {
      return toUnixPath(path)
    }
    else {
      return null
    }
  }
  
  var Path = require("path")
  var toUnixPath = function(path) {
    //# win style
    if(Path.sep == "\\") {
      //# drive
      if(path.match(/^\w:/)) {
        path = "/" + path
      }
      return path.replace(/\\/g, "/")
    }
    //# unix style
    else {
      return path
    }
  }
  
  var toNativePath = function(path) {
    //# win style
    if(Path.sep == "\\") {
      //# drive
      if(path.match(/^\/\w:/)) {
        path = path.slice(1)
      }
      return path.replace(/\//g, "\\")
    }
    //# unix style
    else {
      return path
    }
  }
  
  var commandLineArgs = [].slice.call(process.argv, 1)
  commandLineArgs[0] = toUnixPath(__dirname) + "/../loader.js"
  
  var loaderUrl = commandLineArgs[0]
  execScript(loadFile(loaderUrl), loaderUrl, {
    log: log, 
    loadFile: loadFile, 
    execScript: execScript, 
    lookupModuleFilePath: lookupModuleFilePath, 
    commandLineArgs: commandLineArgs, 
    vendorDir: toUnixPath(__dirname) + "/vendor/" 
  })
  
})(this);