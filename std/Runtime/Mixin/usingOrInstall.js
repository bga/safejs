if(nativeGlobal.regMixinEnv != null) {
  export using
}
else {
  fix dispatch = #(name) {
    -> #(p, ...args) {
      
    }
  }
  
  export #(mixins) {
    fix mix = #(dest, src) {
      Object.keys(src).forEach(#(k) {
        if(dest.hasOwnProperty(k)) {
        }
        else {
          dest[k] = src[k]
        }
      })
    }
    if(mixins.constructor != Array) {
      mixins = [mixins]
    }
    mixins.forEach(#(mixin) {
      # bit optimization, assuming we do not work w/ frames
      ? really
      if(mixin.isInsalled$) {
        
      }
      else {
        mix(mixin.Type.prototype, mixin.methods)
        mixin.isInsalled$ = yes
      }
    })
  }
}