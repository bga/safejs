export mixin(Fn, {
  getModuleFrame: #(p) {
    var f = p
    loop {
      if(f == null || f.hasOwnProperty(`localScope$`)) {
        break
      }
      f = f.parentFn
    }
    -> f
  }
})