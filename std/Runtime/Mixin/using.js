fix undefined

fix hasOwnProperty = #(obj, name) {
  -> Object.prototype.hasOwnProperty.call(obj, name)
}

fix lookupMixinMethod = #(caller, obj, name) {
  # lookup by mixins up
  var ret = null
  loop {
    if(caller == null) {
      break
    }
    if(caller.mixins != null) {
      var mixins = caller.mixins
      var i = 0
      loop {
        if(i >= mixins.length) {
          break
        }
        # { hasOwnProperty }, not { in }, due plain object mix, not whole type chain
        if(hasOwnProperty(mixins[i].methods, name) && translateOwnTypeToFrameType(mixins[i].Type, obj.env$).prototype.isPrototypeOf(Object(obj))) {
          break
        }
        i = $f + 1
      }
      if(i < mixins.length) {
        ret = Object.getOwnPropertyDescriptor(mixins[i].methods, name)
        break
      }
    }
    caller = caller.parentFn
  }
  -> ret
}

fix regMixinEnv
fix hasVirtualDispatch

? crash in Chrome
if(0 && nativeGlobal.Proxy != null) {
  hasVirtualDispatch = yes
  fix lookupRootProto = #(obj) {
    loop {
      fix nextObj = obj.__proto__
      if(nextObj == null) {
        break
      }
      obj = nextObj
    }
    -> obj
  }

  regMixinEnv = #(env) {
    var locksCount = 0
    fix protect = #(f) {
      -> #(p, ...args) {
        locksCount += 1
        try {
          -> f.apply(p, args)
        }
        finally {
          locksCount -= 1
        }
      }
    }

    fix getPropertyDescriptor = #(name) {
      if(locksCount > 0) {
        ->
      }
      try {
        locksCount += 1
        # fix for WebKit
        if(name == `` || name.match(/^\d+$/) 
          # and for node.js, seems somebody caches { Object.defineProperty } and we can not { protect } it. Anyway - nobody will have mixins w/ that name
          || name == `get` || name == `set`
          # fix for builder
          //|| name == `parentFn` 
          //|| name == `eval`
        ) {
          -> undefined
        }
        
        fix caller
        try {
          caller = arguments.callee.caller
        }
        catch(err) {
          caller = null
        }

        # another fix, for { eval }
        if(caller != null && (caller + ``).match(/\}\s*$/) == null) {
          caller = caller.caller
        }

        if(caller != null && hasOwnProperty(caller, `parentFn`)) {
          //console.log(`get `, name)
          //console.log(`get `, name, String(caller).split(`\n`)[0])
          -> {
            __proto__: null,
            configurable: yes,
            enumeratible: no, 
            //writable: yes, 
            get: protect(#(p) {
              //console.log(`get`, name)
              # at that point we know that no { name } in proto chain
              # let find it in our mixins
              var desc = lookupMixinMethod(caller, p, name)
              if(name == `foo`) {
                //console.log(caller.mixins.length)
              }
              if(desc != null) {
                # method
                if(hasOwnProperty(desc, `value`)) {
                  -> desc.value
                }
                # getter
                else if(hasOwnProperty(desc, `get`)) {
                  -> desc.get.call(p)
                }
                else {
                  throw `Unknown type of desc`
                }
              }
              else {
                ->
              }
            }),    
            set: protect(#(v) {
              //console.log(locksCount, name)
              # fix for v8
              fix oldProto = this.__proto__
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
        # 3rd party/native code
        else {
          ->
        }
      }
      finally {
        locksCount -= 1
      }
    }
    
    /*
    var oldDefineProperty = env.Object.defineProperty
    env.Object.defineProperty = #(obj, name, desc) {
      desc.__proto__ = null
      -> oldDefineProperty.call(env.Object, obj, name, desc)
    }
    */
    env.Object.defineProperty = protect(env.Object.defineProperty) 
    env.Object.defineProperties = protect(env.Object.defineProperties) 
    env.Object.create = protect(env.Object.create) 
    
    lookupRootProto(env.Object.prototype).__proto__ = nativeGlobal.Proxy.create({
      __proto__: null,
     
      getPropertyDescriptor: getPropertyDescriptor, 
      # do nothing, act as immutable object
      getOwnPropertyDescriptor: #() {
        -> undefined
      },
      defineProperty: #(name, desc) {
        //assert(`defineProperty is not supported`)
      },
      getPropertyNames: #() {
        -> []
      }, 
      getOwnPropertyNames: #() {
        -> []
      },
      `delete`: #(name) {
        -> no
      }
    }, null)
  }
}
else if((#() {
  try {
    -> ({ 
      __noSuchMethod__: #(p, name, arg) {
        -> name
      }
    }).foo() == `foo`
  }
  catch(err) {
    -> no
  }
})()) {
  hasVirtualDispatch = yes
  regMixinEnv = #(env) {
    env.Object.prototype.__noSuchMethod__ = #(p, name, args) {
      var caller = arguments.callee.caller$
      if(caller != null && caller.hasOwnProperty(`parentFn`)) {
        fix desc = lookupMixinMethod(caller, p, name)
        if(desc && Fn.prototype.isPrototypeOf(desc.value)) {
          -> desc.value.apply(p, args)
        }
        else {
          throw name + ` is not a method`
        }
      }
      else {
        log(`throw`)
        throw nativeGlobal.TypeError()
      }
    }
  }
}
else {
  hasVirtualDispatch = no
  regMixinEnv = #(env) {
  
  }
}

export #(mixins) {
  if(mixins.env$ == null) {
    var env = mixins.hasOwnProperty.constructor(`return (1, eval)('this')`)()
    try {
      # IE8's dom only Object.defineProperty
      env.Object.defineProperty(env.Object.prototype, `env$`, { value: env })
    }
    catch(err) {
      env.Object.prototype.env$ = env
    }
    regMixinEnv(env)
  }

  if(mixins.constructor != Array) {
    mixins = [mixins]
  }
  var caller = arguments.callee.caller$
  if(caller.mixins == null) {
    ? should i make a real class
    caller.mixins = []

    # early - smaller
    caller.mixins.sortTopologically = #(p) {
      p.sort(#(b, d) {
        var B = b.Type
        var D = d.Type
        # we avoid instanceof to prevent { .toObject() } use that is included as { self } - recursion
        if(B.prototype.isPrototypeOf(D.prototype)) {
          -> 1
        }
        else if(B == D) {
          -> 0
        }
        else {
          -> -1
        }
      })
    } 
  }
  
  mixins.forEach(#(srcMixin) {
    # already has that mixin
    if(!caller.mixins.some(#(mixin) {
      -> mixin.Type == srcMixin.Type && mixin.methods == srcMixin.methods
    })) {
      caller.mixins.push(srcMixin)
    }
    
  })
  caller.mixins.sortTopologically()
  
  fix dispatch = #(name, nativeF) {
    fix f = #(p, ...args) {
      var caller = arguments.callee.caller$
      if(caller && caller.hasOwnProperty(`parentFn`)) {
        fix desc = lookupMixinMethod(caller, p, name) || nativeF && { value: nativeF }
        if(desc) {
          -> desc.value.apply(p, args)
        }
        else {
          throw name + ` is not a method`
        }
      }
      else if(nativeF != null) {
        -> nativeF.apply(p, args)
      }
      else {
        throw `Unknown case`
      }
    }
    f.name$ = name
    -> f
  }
  
  fix mix = #(dest, src) {
    Object.keys(src).forEach(#(k) {
      # one of magic properties
      if(k.match(/^__[\w$]*__$/) != null) {
        
      }
      else {
        if(dest[k] !== undefined && !Fn.prototype.isPrototypeOf(dest[k])) {
          throw k + ` can not be mixed`
        }
        if(!hasVirtualDispatch && dest[k] === undefined || dest[k] !== undefined && dest[k].name$ === undefined) {
          dest[k] = dispatch(k, dest[k])
        }
      }
    })
  }
  mixins.forEach(#(mixin) {
    # bit optimization, assuming we do not work w/ frames
    mix(mixin.Type.prototype, mixin.methods)
  })
  
}