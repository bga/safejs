(function(Global)
{
  var selfName = 'loader.browser.js'

  var yes = !0, no = !1
  // node's bug
  if(Global.Object == null) {
    Global = (function(){ return this })() || (1, eval)('this')
  }
  
  var consoleWindow = null
  var log = function() {
    if(Global.console) {
      Function.prototype.apply.call(console.log, console, arguments)
    }
    else if(Global.opera && Global.opera.postError) {
      Global.opera.postError([].join.call(arguments, " "))
    }
    else {
      if(consoleWindow == null) {
        consoleWindow = open("", "log")
        consoleWindow.document.open("text/html")
        consoleWindow.document.write("<html><title>log</title><style>* { padding: 0; margin: 0; } pre { border: 1px dashed black; margin: 2px; }</style><body></body></html>")
        consoleWindow.document.close()
      }
      ;(consoleWindow.document.body.appendChild(consoleWindow.document.createElement("pre"))
        .appendChild(consoleWindow.document.createTextNode([].join.call(arguments, " ")))
      )
    }
  }
  
  this.log = log

  var _findActiveX = function(progIds){
    var i = progIds.length; while(i--)
    {
      try{ new ActiveXObject(progIds[i]) }catch(err){ continue } 
      break
    }
    return (i >= 0) ? progIds[i] : null
  }
  
  var XHR = (Global.XMLHttpRequest
    || Global.ActiveXObject && (function() {
      progId = _findActiveX([
        'Microsoft.XMLHTTP',
        'Msxml2.XMLHTTP',
        'Msxml2.XMLHTTP.3.0',
        'Msxml2.XMLHTTP.4.0',
        'Msxml2.XMLHTTP.5.0',
        'Msxml2.XMLHTTP.6.0',
        'Msxml2.XMLHTTP.7.0',
      ])
      
      return progId && function() {
        return new ActiveXObject(progId)
      }
    })()
  )


  var toWinUrl = function(url){ return url.replace(/\//g, '\\') }
  var loadFile = function(url) {
    var rUrl = toNativePath(url)
    var xhr = new XHR();
    xhr.open('GET', url/* + '?rnd' + Math.random()*/, no)
    xhr.send(null)
    if(xhr.status == 0 || 200 <= xhr.status && xhr.status < 300) {  
      return xhr.responseText
    }
    else {
      return null
    }
  }

  var loadFolder = (function() {
    var cache = {  }
    var parseHtmlBody = function(s) {
      var div = document.createElement("div")
      div.innerHTML = (s.match(/<body.*>(.*)<\/body>/m) || ["", s])[1]
      var anchors = div.getElementsByTagName("a")
      var json = { files: {  }, folders: {  } }
      ;[].forEach.call(anchors, function(anchor) {
        var href = unescape(anchor.innerHTML)
        //# folder
        if(href != "../" && href.match(/\/$/)) {
          json.folders[href.slice(0, -1)] = 1
        }
        else {
          json.files[href] = 1
        }
      })
      return json
    }
    return function(url) {
      if(url in cache) {
        return cache[url]  
      }
      else {
        //log(url)
        var html = loadFile(url)
        if(html != null) {
          return (cache[url] = parseHtmlBody(html))
        }
        else {
          return (cache[url] = null)
        }
      } 
    }
  })()

  //# actually it does not give error, it shows error in console
  var getSyntaxError = function(code, url) {
    var getBlobUrl = (
      Global.URL && Global.URL.createObjectURL && function(blob) {
        return Global.URL.createObjectURL(blob)
      }
      || Global.createObjectURL && function(blob) {
        return Global.createObjectURL(blob)
      }
      // FF4+
      || Global.createBlobURL && function(blob) {
        return Global.createBlobURL(blob)
      }
      || null
    )
    
    if(getBlobUrl) {
      var s = document.createElement("script")
      s.src = getBlobUrl(new Blob(["/* " + url + " */ ;(function() { return; " + code + " })"], { type: "text/javascript" }))
      document.documentElement.appendChild(s)
      setTimeout(function() {
        document.documentElement.removeChild(s)
      }, 100)
      
      return "Syntax error in at console"
    }
    else {
      return "Showing syntax is techically impossible"
    }
  }
  
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
    var reduce = function(vs, f, ret) {
      var i = -1; while(++i < vs.length) {
        ret = f(ret, vs[i], i, vs)
      }
      return ret
    }
    var wideLookup = function(path) {
      var all = loadFolder(path)
      //log(all)
      var files = Object.keys(all.files)
      var fileKey = findInArray(files, function(v) {
        return v.match(/^.*(?=\.)/)[0] == className
      })
      
      if(fileKey != null) {
        return path.concat(files[fileKey])
      }
      else {
        var dirs = Object.keys(all.folders)
        return reduce(dirs, function(ret, v) {
          return ret || wideLookup((path.concat(v)).concat("".concat("/")))
        }, null)
      }
    }
    if(loadFolder(toNativePath(root)) == null) {
      return null
    }
    else {
      var ret = wideLookup(toNativePath(root))
      if(ret != null) {
        ret = toUnixPath(ret)
      }
      return ret
    }
  }

  var toUnixPath = function(path) {
    return path
  }
  
  var toNativePath = function(path) {
    return path
  }
  
  var selfScriptNode = (function(selfName) {
    var ss = document.getElementsByTagName('script')
    var i = -1; while(++i < ss.length) {
      var s = ss.item(i);
      if(s.src.indexOf(selfName) > -1)
        return s;
    }
  })(selfName)

  var selfPath = selfScriptNode.src.replace(/#.*$/, "")
  var loaderFolderPath = selfPath.match(/^.*\//)[0]
  var selfFolderPath = loaderFolderPath + "../"
  
  var loadCommonJsModule = function(url) {
    var exports = {  }
    execScript(loadFile(url), url, { "exports": exports })
    return exports
  }
  var commandLineArgs = (function() {
    var parseArgs = loadCommonJsModule(loaderFolderPath + "parseArgs.js")._
    var commandLineArgsString = unescape(selfScriptNode.src.slice(selfScriptNode.src.indexOf("#") >>> 0).slice(1)).replace(/^\s+|\s+$/g, "")
    return parseArgs(commandLineArgsString)
  })()
  
  commandLineArgs.unshift(toUnixPath(selfFolderPath + "loader.js"))
  
  var loaderUrl = selfFolderPath + "loader.js"
  loadCommonJsModule(loaderFolderPath + "domReady.js")._(function() {
    //alert(1)
    execScript(loadFile(loaderUrl), loaderUrl, {
      log: log, 
      loadFile: loadFile, 
      getSyntaxError: getSyntaxError, 
      execScript: execScript, 
      lookupModuleFilePath: lookupModuleFilePath, 
      commandLineArgs: commandLineArgs, 
      vendorDir: toUnixPath(loaderFolderPath) + "vendor/" 
    })
  })
  
})(this);