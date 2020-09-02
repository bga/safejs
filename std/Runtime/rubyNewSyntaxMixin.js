export [
  mixin(Fn, {
    new$: #(p, ...args) {
      var obj = Object.create(p.prototype)
      var ret = p.apply(obj, args) 
      if(ret != null) {
        -> ret
      }
      else {
        -> obj
      }
    }
  })
]

# some fixes, thx to @abozhilov
Date.new$ = #(...args) {
  fix D = Date
  if(args.length == 0) {
    -> new D()
  }
  else if(args.length == 1) {
    var timeStampOrStringFormat = args[0]
    -> new D(timeStampOrStringFormat)
  }
  else if(args.length == 3) {
    -> new D(args[0], args[1], args[2])
  }
  else if(args.length == 7) {
    -> new D(args[0], args[1], args[2], args[3], args[4], args[5], args[6])
  }
}
String.new$ = Number.new$ = #(p, a) {
  -> Object(p(a))
}

spec {
  using(Self)
  assert(Array.new$(1, 2, 3).join(`, `) == `1, 2, 3`)
  assert(String.new$(1) == `1`)
  assert(Number.new$(`1`) == 1)
  assert(Date.new$(100).valueOf() == 100)
  // assert(Date.new$(0).valueOf() == 0)
}
