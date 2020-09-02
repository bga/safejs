export #(f) {
  f.parentFn = arguments.callee.caller
  fix wrappedF = wrapFn$(f, f)
  var finalWrap = #(p, ...args) {
    var oldCaller = f.caller$
    try {
      f.caller$ = arguments.callee.caller
    }
    catch(err) {
      f.caller$ = null
    }
    f.p = p
    fix ret = wrappedF.apply(p, args)
    f.caller$ = oldCaller
    -> ret
  }
  finalWrap.origFn = f
  finalWrap.parentFn = f.parentFn
  -> finalWrap
}