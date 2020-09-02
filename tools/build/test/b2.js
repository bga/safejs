(function() {
  var yes = !0, no = !1

if(Object.create == null) {
  Object.create = function(proto) {
    var f = function() {
    }
    f.prototype = proto
    return new f()
  }
}

if("".trim == null) {
  var wses = "[\u0009\u000D\u0020'\u000B\u000C\u00A0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]"
  String.prototype.trim = function() {
    return this.replace(RegExp("^" + wses + "+|" + wses + "+$", "g"), "")
  }
}

if([].indexOf == null) {
  Array.prototype.indexOf = function(value, begin) {
    var end = this.length
    
    if(begin == null) {  
      begin = -1
    }
    else if(begin < 0) {
      begin += end - 1
      
      if(begin < -1) {
        begin = -1
      }
    }
    else if(begin >= end) {
      return -1
    }
    else {
      --begin
    }
    
    while(++begin < end && this[begin] !== value) {
      
    }
    
    return (begin !== end) ? begin : -1
  }
}

if([].lastIndexOf == null) {
  Array.prototype.lastIndexOf = function(value, end) {
    var len = this.length
    
    if(end == null) {
      end = len
    }
    else if(end < 0) {
      end += len + 1;
      
      if(end < 1) {
        return -1
      }
    }
    else if(end >= len) {
      end = len
    }
    else {
      ++end
    }
    
    while(end-- && this[end] !== value) {
      
    }
    
    return end
  };

}

if(Object.keys == null) {
  var unenumerableObjPropNames = (function() {
    var possibleUnenumerableObjPropNames = "constructor__defineGetter__ __proto__ __parent__ __count__ __defineSetter__ eval hasOwnProperty isPrototypeOf __lookupGetter__ __lookupSetter__ __noSuchMethod__ propertyIsEnumerable toSource toLocaleString toString unwatch valueOf watch".split(/\s+/)
    var obj = {  }
    var i = possibleUnenumerableObjPropNames.length; while(i--) {
      obj[possibleUnenumerableObjPropNames[i]] = 1
    }
    for(var i in obj) {
      possibleUnenumerableObjPropNames.splice(possibleUnenumerableObjPropNames.indexOf(i), 1)
    }
    return possibleUnenumerableObjPropNames
  })()

  Object.keys = function(obj) {
    var out = []
    for(var k in obj) {
      if(obj.hasOwnProperty(k)) {
        out.push(k)
      }
    }
    var i = unenumerableObjPropNames.length; while(i--) {
      var propName = unenumerableObjPropNames[i]
      if(obj.hasOwnProperty(propName)) {
        out.push(propName)
      }
    }
    return out
  }
}

if([].forEach == null) {
  Array.prototype.forEach = function(f, that) {
    var i = -1; while(++i < this.length) {
      f.call(that, this[i], i, this)
    }
  }
}
if(1 || [].map == null) {
  Array.prototype.map = function(f, that) {
    var out = []
    var i = -1; while(++i < this.length) {
      out[i] = f.call(that, this[i], i, this)
    }
    return out
  }
}
if([].filter == null) {
  Array.prototype.filter = function(f, that) {
    var out = []
    var i = -1; while(++i < this.length) {
      if(f.call(that, this[i], i, this)) {
        out.push(this[i]) 
      }
    }
    return out
  }
}
if([].every == null) {
  Array.prototype.every = function(f, that) {
    var i = -1; while(++i < this.length) {
      if(!f.call(that, this[i], i, this)) {
        return no 
      }
    }
    return yes
  }
}
if([].some == null) {
  Array.prototype.some = function(f, that) {
    var i = -1; while(++i < this.length) {
      if(f.call(that, this[i], i, this)) {
        return yes 
      }
    }
    return no
  }
}

})()
var f$ = (function(export$) {
  with(export$) {
    export$.self = export$.Self = [""
    ,"//# child fn"
    ,"if(typeof(parentFn$) != \"undefined\") {"
    ,"  arguments.callee.parentFn = parentFn$"
    ,"}"
    ,"else {"
    ,"  arguments.callee.parentFn = null"
    ,"}"
    ,"eval(\"var parentFn$ = arguments.callee\")"
    ,"//? should be wrapped into { _desugarfyJS }"
    ,"//? also local { eval$ } as wrapped { eval } too"
    ,"arguments.callee.eval = function(s) {"
    ,"  return eval(s)"
    ,"}"
    ].join("\n").slice(1)
    return export$.self
  }
})({  })

var nativeGlobal = (function(export$) {
  with(export$) {
    eval(f$); export$.self = export$.Self = (1, eval)("this")
    return export$.self
  }
})({  })

var cwd = (function(export$) {
  with(export$) {
    eval(f$); var shell = new nativeGlobal.ActiveXObject("WScript.Shell")
    export$.self = export$.Self = shell.CurrentDirectory + "/"
    return export$.self
  }
})({  })

var commandLineArgs = (function(export$) {
  with(export$) {
    eval(f$); export$.self = export$.Self = (function() { eval(f$);
      var out = []
      var i = -1; while(++i < nativeGlobal.WScript.Arguments.Length) {
        out.push(nativeGlobal.WScript.Arguments.Item(i))
      }
      return out
    })()
    return export$.self
  }
})({  })

var no = (function(export$) {
  with(export$) {
    eval(f$); export$.self = export$.Self = !1
    return export$.self
  }
})({  })

var log = (function(export$) {
  with(export$) {
    eval(f$); export$.self = export$.Self = function() { eval(f$); var args = [].slice.call(arguments, 0);
      nativeGlobal.WScript.Echo(args.join(', '))
    }
    return export$.self
  }
})({  })

var Object = (function(export$) {
  with(export$) {
    eval(f$); export$.self = export$.Self = nativeGlobal.Object
    return export$.self
  }
})({  })

var mixin = (function(export$) {
  with(export$) {
    eval(f$); export$.self = export$.Self = function(Type, methods) { eval(f$);
      return {
        Type: Type,
        methods: methods
      }
    }
    return export$.self
  }
})({  })

var objectNot$Mixin = (function(export$) {
  with(export$) {
    eval(f$); export$.self = export$.Self = mixin(Object, {
      not$: function(f) { eval(f$); var p = this;
        return !f(p)
      }
    })
    return export$.self
  }
})({  })

var Array = (function(export$) {
  with(export$) {
    eval(f$); export$.self = export$.Self = nativeGlobal.Array
    return export$.self
  }
})({  })

var assert = (function(export$) {
  with(export$) {
    eval(f$); export$.self = export$.Self = function(expr, msg) { eval(f$);
      if(!expr) {
        throw nativeGlobal.Error(msg)
      }
    }
    return export$.self
  }
})({  })

var for$ = (function(export$) {
  with(export$) {
    eval(f$); //# new version
    //? old version has { assert(begin <= end) }
    export$.self = export$.Self = function(range, f) { eval(f$);
      var begin = range[0]
      var end = range[2]
      var step = range[4] || 1
    
      assert(step >= 0)
      var shift = nativeGlobal.Math.abs(end - begin) % step
      if(shift > 0) {
        if(begin <= end) {
          end = end + step - shift
        }
        else {
          end = end + shift - step
        }
      }
      if(range[1] == "<<") {
        begin = begin - step
        end = end - step
        var temp$ = begin; begin = end; end = temp$
      }
      if(begin >= end) {
        step = -step
      }
      for(var i = begin; i != end; i += step) {
        f(i)
      }
    }
    return export$.self
  }
})({  })

var using = (function(export$) {
  with(export$) {
    eval(f$); var lookupMixinByType = function(mixins, Type) { eval(f$);
      var i = 0
      for(;;) {
        if(i >= mixins.length) {
          break 
        }
        if(mixins[i].Type == Type) {
          break 
        }
        i += 1
      }
      if(i >= mixins.length) {
        i = null
      }
      return i
    }
    
    export$.self = export$.Self = function(mixins) { eval(f$);
      if(mixins.constructor != Array) {
        mixins = [mixins]
      }
      var caller = arguments.callee.caller
      if(caller.mixins == null) {
        //? should i make a real class
        caller.mixins = []
    
        //# early - smaller
        caller.mixins.sortTopologically = function() { eval(f$); var p = this;
          p.sort(function(b, d) { eval(f$);
            var B = b.Type
            var D = d.Type
            //# we avoid instanceof to prevent { .toObject() } use that is included as { self } - recursion
            if(B.prototype.isPrototypeOf(D.prototype)) {
              return 1
            }
            else if(B == D) {
              return 0
            }
            else {
              return -1
            }
          })
        }
      }
    
      for$([0, ">>", mixins.length], function(i) { eval(f$);
        var mixin = mixins[i]
        var k = lookupMixinByType(caller.mixins, mixins[i].Type)
        //# already has that mixin
        if(k != null && caller.mixins[k].mixins == mixin.methods) {
          //# skip
        }
        else {
          caller.mixins.push(mixin)
        }
      })
      caller.mixins.sortTopologically()
    }
    return export$.self
  }
})({  })

var usingOrInstall = (function(export$) {
  with(export$) {
    eval(f$); if(nativeGlobal.regMixinEnv != null) {
      export$.self = export$.Self = using
    }
    else {
      export$.self = export$.Self = function(mixins) { eval(f$);
        var mix = function(dest, src) { eval(f$);
          Object.keys(src).forEach(function(k) { eval(f$);
            if(!dest.hasOwnProperty(k)) {
              dest[k] = src[k]
            }
          })
        }
        if(mixins.constructor != Array) {
          mixins = [mixins]
        }
        mixins.forEach(function(mixin) { eval(f$);
          mix(mixin.Type.prototype, mixin.methods)
        })
      }
    }
    return export$.self
  }
})({  })

var test = (function(export$) {
  with(export$) {
    eval(f$); usingOrInstall(objectNot$Mixin); export$.self = export$.Self = function(args) { eval(f$);
      log({ a: no }.not$(function(_) { eval(f$); return _.a }))
    }
    
    self(commandLineArgs, cwd)
    return export$.self
  }
})({  })
