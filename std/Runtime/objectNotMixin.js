export mixin(Object, Object.defineProperties({ __proto__: null }, {
  not: {
    __proto__: null
    configurable: yes
    get: #(p) {
      if(!p.hasOwnProperty(`notCache$`)) {
        fix proxy = {
          __proto__: null
          getPropertyDescriptor: #(name) {
            var caller = arguments.callee.caller$
            if(caller == null || !caller.hasOwnProperty(`parentFn`)) {
              ->
            }
            //log(`here`, name)
            var desc = Object.getPropertyDescriptor(p, name)
            if(desc != null) {
              if(({  }).hasOwnProperty.call(desc, `value`) && desc.value.constructor == Fn) {
                fix oldV = desc.value 
                desc.value = #(...args) {
                  -> !oldV.apply(p, args)
                }
              }
              else {
                desc = {
                  get: #() {
                    -> !(p[name])
                  }
                }
              }
              desc.__proto__ = null
              desc.configurable = yes
              desc.enumeratible = yes
              -> desc
            }
            else {
              -> 
            }
          } 
        }
        p.notCache$ = nativeGlobal.Proxy.create(proxy, null)
      }
      
      -> p.notCache$
    } 
  }
}))

spec {
  using(Self)
  assert({ a: no }.not.a)
  assert({ 
    a: #(p) { 
      -> p.b
    }
    b: no
  }.not.a())
}