export #(f) {
  -> #(p, ...args) {
    fix fName = f.toString().match(/function\s*(.*?)\(/)[1]
    fix sd = +Date.new()
    var ret
    var n = 0
    var ed
    loop {
      ret = f.apply(p, args)
      n = $f + 1
      ed = +Date.new()
      if(ed - sd > 1000) {
        break
      } 
    }
    log(n)
    log(fName + ` :: ` + ((ed - sd) / n)  + `ms`)
    -> ret
  }
}
