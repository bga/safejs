(function(Global)
{
  // node's bug
  if(Global.Object == null) {
    Global = (function(){ return this })() || (1, eval)('this')
  }
  
  // redirect console to stderr
  var log = function() {
    WScript.StdErr.WriteLine([].join.call(arguments, ', '))
  } 
  
  this.log = log

  var toWinUrl = function(url){ return url.replace(/\//g, '\\') }
  var fso = new ActiveXObject("Scripting.FileSystemObject");
  var loadFile = function(url) {
    var rUrl = toNativePath(url)
    if(!fso.FileExists(rUrl)) {
      return null
    }
    try {
      var ts = fso.OpenTextFile(rUrl, 1, -1)
      var t = ts.ReadAll()
      ts.Close()
      return t
    }
    catch(err) {
      return null
    }
  }
  
  var getSyntaxError = function(s, url) {
    //# find temp fileName for put script
    var i = 0
    var tempFolderPath = fso.GetSpecialFolder(2) + "\\"
    var urlFileName = url.match(/[^\/\\]*?$/)[0]
    var path
    for(;;) {
      path = tempFolderPath + urlFileName + i + ".js"
      if(!fso.FileExists(path)) {
        break
      }
      i = i + 1
    }
    
    //# put script's content, wrapped into { function } to prevent execution
    log(path)
    var f = fso.OpenTextFile(path, 2, true, 0)
    f.Write("/* " + url + " */ !function() { " + s + " }")
    f.Close()
    
    //# run cscript with path, read stderr
    var exe = shell.Exec("cscript " + path)
    var stdErr = ""
    for(;;) {
      if(!exe.StdErr.AtEndOfStream) {
        stdErr += exe.StdErr.ReadAll() 
      }
      if(exe.Status == 1) {
        break
      }
      WScript.Sleep(100)
    }
    return stdErr
  }
  var shell = new ActiveXObject("WScript.Shell")
  var execScript = function(s, url, imports) {
    var names = []
    var vs = []
    for(var i in imports) {
      if(imports.hasOwnProperty(i)) {
        names.push(i)
        vs.push(imports[i])
      }
    }
    var f
    try {
      f = Function(names, s)
    }
    catch(err) {
      if(err instanceof SyntaxError) {
        throw new SyntaxError(getSyntaxError(s, url))
      }
      else {
        throw err
      }
    }
    return f.apply(Global, vs)
  }
  
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
  var lookupModuleFilePath = function(root, ver, className) {
    var subFiles = function(folderUrl) {    
      var rUrl = toWinUrl(folderUrl)
      var _cut = function(s) { 
        return s.slice(s.lastIndexOf('\\') + 1) 
      }
      var folder = fso.GetFolder(rUrl)
      var fileNames = [], j = 0
      var _append = function(e) {
        for(; !e.atEnd(); e.moveNext()) {
          fileNames[j++] = _cut(e.item().Path)
        }
      }
      _append(new Enumerator(folder.Files))
      _append(new Enumerator(folder.SubFolders))
      return fileNames
    }
    
    var reduce = function(vs, f, ret) {
      var i = -1; while(++i < vs.length) {
        ret = f(ret, vs[i], i, vs)
      }
      return ret
    }
    var wideLookup = function(path) {
      var all = subFiles(path)
      var files = all.filter(function(v) {
        return fso.FileExists(path.concat(v))
      })
      var fileKey = findInArray(files, function(v) {
        return fso.GetBaseName(v) == className
      })
      
      if(fileKey != null) {
        return path.concat(files[fileKey])
      }
      else {
        var dirs = all.filter(function(v) {
          return v.indexOf(".") == -1 && fso.FolderExists(path.concat(v))
        })
        return reduce(dirs, function(ret, v) {
          return ret || wideLookup((path.concat(v)).concat("".concat("\\")))
        }, null)
      }
    }
    var ret = wideLookup(toNativePath(root))
    if(ret != null) {
      ret = toUnixPath(ret)
    }
    return ret
  }

  var toUnixPath = function(path) {
    //# drive
    if(path.match(/^\w:/)) {
      path = "/" + path
    }
    return path.replace(/\\/g, "/")
  }
  
  var toNativePath = function(path) {
    //# drive
    if(path.match(/^\/\w:/)) {
      path = path.slice(1)
    }
    return path.replace(/\//g, "\\")
  }
  
  var selfFolderPath = fso.GetParentFolderName(WScript.ScriptFullName) + "/../"
  
  var commandLineArgs = (function() {
    var out = []
    var i = -1; while(++i < WScript.Arguments.Length) {
      out.push(WScript.Arguments.Item(i))
    }
    return out
  })()
  commandLineArgs.unshift(toUnixPath(selfFolderPath + "loader.js"))
  
  var loaderUrl = selfFolderPath + "loader.js"
  execScript(loadFile(loaderUrl), loaderUrl, {
    log: log, 
    loadFile: loadFile, 
    getSyntaxError: getSyntaxError, 
    execScript: execScript, 
    lookupModuleFilePath: lookupModuleFilePath, 
    commandLineArgs: commandLineArgs, 
    vendorDir: toUnixPath(fso.GetParentFolderName(WScript.ScriptFullName)) + "/vendor/" 
  })
  
})(this);