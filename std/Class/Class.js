export #(Super, def) {
  assert(Super == Object => def.constructor != null)
  var proto = Object.create(Super.prototype)
  Object.keys(def).forEach(#(k) {
    fix f = def[k]
    f.super = Super.prototype[k]
    proto[k] = f
  })
  proto.super = #(p, ...args) {
    var f = arguments.callee.caller$
    loop {
      if(f == null) {
        break
      }
      if(f.super != null) {
        break
      }
      f = f.parentFn
    }
    assert(f != null)
    -> f.super.apply(p, args)
  }
  proto.constructor = #(p) {
    Super.call(p)
    if(def.constructor != null) {
      def.constructor.call(p)
    }
  }
  proto.Super = Super
  proto.getSlotNames = #(p) {
    -> Object.keys(p)
  }
  proto.getMethodNames = #(p) {
    var allMethodNames = []
    var proto = p.Super.prototype
    loop {
      if(proto == null) {
        break
      }
      allMethodNames = $f.concat(Object.getOwnPropertyNames(proto))
      proto = Object.getPrototypeOf($f)
    }
    -> allMethodNames.sort().join(` `).replace(/(\w+)(\s\1)*/g, `$1`).split(/\s+/)
  }
  proto.constructor.prototype = proto
  proto.copy = #(p) {
    var obj = Object.create(Object.getPrototypeOf(p))
    p.getSlotNames().forEach(#(slotName) {
      if(p[slotName] == null) {
        obj[slotName] = null
      }
      else {
        obj[slotName] = p[slotName].copy()
      }
    })
  }
  -> proto.constructor
}

spec {
  fix A = Class(Object, {
    constructor: #(p) {
      p.a = 1
    }
    getA: #(p) {
      -> p.a
    }
    setA: #(p, v) {
      p.a = v
    }
  })
  fix B = Class(A, {
    constructor: #(p) {
      p.b = 3
    }
    setA: #(p, v) {
      p.a = v + 1
    }
    getB: #(p) {
      -> p.b
    }
    setB: #(p, v) {
      p.b = v
    }
  })
  assert(A.new().a == 1)
  assert(A.new(){ $.setA(2) }.getA() == 2)
  assert(B.new(){ $.setA(2) }.getA() == 3)
  assert(B.new().a == 1 && B.new().b == 3)
  assert(B.new(){ $.setB(2) }.getB() == 2)
}
