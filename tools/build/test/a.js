;(1, eval)("this").require = require
;(function() {
var parentFn$ = null
;(function() {
  
var yes = !0, no = !1
var Object = this.Object, Array = this.Array

if(1 || Object.getPropertyDescriptor == null) {
  Object.getPropertyDescriptor = function(obj, name) {
    var desc = null
    loop_12: for(;;) {
      if(obj == null) {
        break loop_12
      }
      if(Object().hasOwnProperty.call(obj, name)) {
        break loop_12
      }
      obj = Object.getPrototypeOf(obj)
    }
    if(obj == null) {
      return null
    }
    else {
      return Object.getOwnPropertyDescriptor(obj, name)
    }
  }
}

if(Object.create == null) {
  Object.create = function(proto) {
    var f = function() {
    }
    f.prototype = proto
    return new f()
  }
}

if(1 || "".trim == null) {
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

if(1 || [].lastIndexOf == null) {
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

if(1 || Object.keys == null) {
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

if(1 || [].forEach == null) {
  Array.prototype.forEach = function(f, that) {
    var i = -1; while(++i < this.length) {
      if(this.hasOwnProperty(i)) {
        f.call(that, this[i], i, this)
      }
    }
  }
}
if(1 || [].map == null) {
  Array.prototype.map = function(f, that) {
    var out = []
    var i = -1; while(++i < this.length) {
      if(this.hasOwnProperty(i)) {
        out[i] = f.call(that, this[i], i, this)
      }
    }
    return out
  }
}
if(1 || [].filter == null) {
  Array.prototype.filter = function(f, that) {
    var out = []
    var i = -1; while(++i < this.length) {
      if(this.hasOwnProperty(i)) {
        if(f.call(that, this[i], i, this)) {
          out.push(this[i]) 
        }
      }  
    }
    return out
  }
}
if(1 || [].every == null) {
  Array.prototype.every = function(f, that) {
    var i = -1; while(++i < this.length) {
      if(this.hasOwnProperty(i)) {
        if(!f.call(that, this[i], i, this)) {
          return no 
        }
      }  
    }
    return yes
  }
}
if(1 || [].some == null) {
  Array.prototype.some = function(f, that) {
    var i = -1; while(++i < this.length) {
      if(this.hasOwnProperty(i)) {
        if(f.call(that, this[i], i, this)) {
          return yes 
        }
      }  
    }
    return no
  }
}
if(1 || [].reduce == null) {
  Array.prototype.reduce = function(f, init) {
    var i = 0

    if(arguments.length == 1) {
      while(i < this.length && !this.hasOwnProperty(i)) {
        i = i + 1
      }
    }  
    while(i < this.length) {
      if(this.hasOwnProperty(i)) {
        init = f(init, this[i], i, this)
      }
      i = i + 1
    }
    return init
  }
}
}).call((1, eval)("this"))

this.regMixinEnv = (function(exports) {
var nativeGlobal = this
var yes = !0, no = !1

var hasOwnProperty = function(obj, name) {
  return Object.prototype.hasOwnProperty.call(obj, name)
}

var lookupRootProto = function(obj) {
   for(;;) {
    var nextObj = obj.__proto__
    if(nextObj == null) {
      break
    }
    obj = nextObj
  }
  return obj
}

var translateOwnTypeToFrameType = function(OwnType, frameEnv) {
  if(OwnType.env$ == frameEnv) {
    return OwnType
  }
  else {
    var ownEnvNames = Object.getOwnPropertyNames(env)

    var i = 0
    for(;;) {
      if(i >= ownEnvNames.length) {
        break
      }
      if(env[ownEnvNames[i]] == OwnType) {
        break
      }
      i = i + 1
    }

    if(i >= ownEnvNames.length) {
      return null
    }
    else {
      return frameEnv[ownEnvNames[i]]
    }
  }
}

var lookupMixinMethod = function(caller, obj, name) {
  //# lookup by mixins up
  var ret = null
  for(;;) {
    if(caller == null) {
      break
    }
    if(caller.mixins != null) {
      var mixins = caller.mixins
      var i = 0
      for(;;) {
        if(i >= mixins.length) {
          break
        }
        //# { hasOwnProperty }, not { in }, due plain object mix, not whole type chain
        if(hasOwnProperty(mixins[i].methods, name) && Object(obj) instanceof translateOwnTypeToFrameType(mixins[i].Type, obj.env$)) {
          break
        }
        i = i + 1
      }
      if(i < mixins.length) {
        ret = Object.getOwnPropertyDescriptor(mixins[i].methods, name)
        break
      }
    }
    caller = caller.parentFn
  }
  return ret
}

exports.regMixinEnv = function(env) {
  var locksCount = 0
  var protect = function(f) {
    return function() {
      locksCount += 1
      try {
        return f.apply(this, arguments)
      }
      finally {
        locksCount -= 1
      }
    }
  }

  var getPropertyDescriptor = function(name) {
    if(locksCount > 0) {
      return
    }
    try {
      locksCount += 1
      //# fix for WebKit
      if(name == "" || name.match(/^\d+$/) 
        //# and for node.js, seems somebody caches { Object.defineProperty } and we can not { protect } it. Anyway - nobody will have mixins w/ that name
        || name == "get" || name == "set"
        //# fix for builder
        || name == "parentFn$" || name == "parentFn" || name == "eval"
      ) {
        return
      }

      try {
        var caller = arguments.callee.caller
      }
      catch(err) {
        caller = null
      }

      if(caller != null && hasOwnProperty(caller, "parentFn")) {
        //console.log("get ", name)
        //console.log("get ", name, String(caller).split("\n")[0])
        return {
          __proto__: null,
          configurable: yes,
          enumeratible: no, 
          //writable: yes, 
          get: protect(function() { var p = this;
            //# at that point we know that no { name } in proto chain
            //# let find it in our mixins
            var desc = lookupMixinMethod(caller, p, name)
            if(desc != null) {
              //# method
              if(hasOwnProperty(desc, "value")) {
                return desc.value
              }
              //# getter
              else if(hasOwnProperty(desc, "get")) {
                return desc.get.call(p)
              }
              else {
                throw "Unknown type of desc"
              }
            }
            else {
              return
            }
          }),    
          set: protect(function(v) {
            //console.log(locksCount, name)
            //# fix for v8
            var oldProto = this.__proto__
            this.__proto__ = null
            this[name] = v
            /*
            Object.defineProperty(this, name, {
              __proto__: null, 
              configurable: yes, 
              enumerate: yes, 
              value: v, 
              writable: yes
            })
            */
            this.__proto__ = oldProto
          })
        }
      }
      //# 3rd party/native code
      else {
        return
      }
    }
    finally {
      locksCount -= 1
    }
  }
  
  env.Object.defineProperty(env.Object.prototype, "env$", { value: env })
  /*
  var oldDefineProperty = env.Object.defineProperty
  env.Object.defineProperty = function(obj, name, desc) {
    desc.__proto__ = null
    return oldDefineProperty.call(env.Object, obj, name, desc)
  }
  */
  env.Object.defineProperty = protect(env.Object.defineProperty) 
  env.Object.defineProperties = protect(env.Object.defineProperties) 
  env.Object.create = protect(env.Object.create) 
  
  lookupRootProto(env.Object.prototype).__proto__ = Proxy.create({
    __proto__: null,
   
    getPropertyDescriptor: getPropertyDescriptor, 
    //# do nothing, act as immutable object
    getOwnPropertyDescriptor: function() {
      return undefined
    },
    defineProperty: function(name, desc) {
      //assert("defineProperty is not supported")
    },
    getPropertyNames: function() {
      return []
    }, 
    getOwnPropertyNames: function() {
      return []
    },
    "delete": function(name) {
      return no
    }
  }, null)
  
  return {
    env: env, 
    protect: protect 
  }
}
return exports
}).call(this, {  }).regMixinEnv
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
})({ __proto__: null })

var nativeGlobal = (function(export$) {
  with(export$) {
    eval(f$); export$.self = export$.Self = (1, eval)("this")
    return export$.self
  }
})({ __proto__: null })

var require = (function(export$) {
  with(export$) {
    eval(f$); //# require { (1, eval)(`this`).require = require } in top level due node define { require } as local var
    export$.self = export$.Self = nativeGlobal.require
    return export$.self
  }
})({ __proto__: null })

this.regMixinEnv(this)

var nativePathToUnixPath = (function(export$) {
  with(export$) {
    eval(f$); var Path = require("path")
    export$.self = export$.Self = function(path) { eval(f$);
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
    return export$.self
  }
})({ __proto__: null })

var cwd = (function(export$) {
  with(export$) {
    eval(f$); export$.self = export$.Self = nativePathToUnixPath(nativeGlobal.process.cwd()) + "/"
    return export$.self
  }
})({ __proto__: null })

var commandLineArgs = (function(export$) {
  with(export$) {
    eval(f$); export$.self = export$.Self = (function() { eval(f$);
      var args = [].slice.call(nativeGlobal.process.argv, 1)
      args[0] = nativePathToUnixPath(args[0])
    })()
    return export$.self
  }
})({ __proto__: null })

var no = (function(export$) {
  with(export$) {
    eval(f$); export$.self = export$.Self = !1
    return export$.self
  }
})({ __proto__: null })

var log = (function(export$) {
  with(export$) {
    eval(f$); export$.self = export$.Self = function() { eval(f$); var args = [].slice.call(arguments, 0);
      nativeGlobal.process.stderr.write(args.join(', '))
    }
    return export$.self
  }
})({ __proto__: null })

var yes = (function(export$) {
  with(export$) {
    eval(f$); export$.self = export$.Self = !0
    return export$.self
  }
})({ __proto__: null })

var Fn = (function(export$) {
  with(export$) {
    eval(f$); export$.self = export$.Self = nativeGlobal.Function
    return export$.self
  }
})({ __proto__: null })

var Object = (function(export$) {
  with(export$) {
    eval(f$); export$.self = export$.Self = nativeGlobal.Object
    return export$.self
  }
})({ __proto__: null })

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
})({ __proto__: null })

var objectToObjectMixin = (function(export$) {
  with(export$) {
    eval(f$); export$.self = export$.Self = mixin(Object, {
      toObject: function() { eval(f$); var p = this;
        return p
      }
    })
    return export$.self
  }
})({ __proto__: null })

var Array = (function(export$) {
  with(export$) {
    eval(f$); export$.self = export$.Self = nativeGlobal.Array
    return export$.self
  }
})({ __proto__: null })

var assert = (function(export$) {
  with(export$) {
    eval(f$); export$.self = export$.Self = function(expr, msg) { eval(f$);
      if(!expr) {
        throw nativeGlobal.Error(msg)
      }
    }
    return export$.self
  }
})({ __proto__: null })

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
})({ __proto__: null })

var using = (function(export$) {
  with(export$) {
    eval(f$); var lookupMixinByType = function(mixins, Type) { eval(f$);
      var i = 0
      loop_3: for(;;) {
        if(i >= mixins.length) {
          break loop_3
        }
        if(mixins[i].Type == Type) {
          break loop_3
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
})({ __proto__: null })

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
})({ __proto__: null })

var objectNotMixin = (function(export$) {
  with(export$) {
    eval(f$); usingOrInstall(objectToObjectMixin); export$.self = export$.Self = mixin(Object, Object.defineProperties({ __proto__: null }, {
      not: {
        __proto__: null,
        configurable: yes,
        get: function() { eval(f$); var p = this;
          if(!p.hasOwnProperty("notCache$")) {
            var proxy = {
              getPropertyDescriptor: function(name) { eval(f$);
                var desc = Object.getPropertyDescriptor(p, name)
                if(desc != null) {
                  if(({  }).hasOwnProperty.call(desc, "value") && desc.value.toObject() instanceof Fn) {
                    var oldV = desc.value
                    desc.value = function() { eval(f$);
                      return !oldV.apply(p, arguments)
                    }
                  }
                  else {
                    desc = {
                      __proto__: null,
                      get: function() { eval(f$);
                        return !(p[name])
                      }
                    }
                  }
                  desc.configurable = yes
                  return desc
                }
                else {
                  return
                }
              }
            }
            p.notCache$ = nativeGlobal.Proxy.create(proxy, null)
          }
    
          return p.notCache$
        }
      }
    }))
    return export$.self
  }
})({ __proto__: null })

var test = (function(export$) {
  with(export$) {
    eval(f$); using(objectNotMixin); export$.self = export$.Self = function(args) { eval(f$);
      log({ a: no }.not.a)
    }
    
    self(commandLineArgs, cwd)
    return export$.self
  }
})({ __proto__: null })
}).call((1, eval)("this"))