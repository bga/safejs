export mixin(Number, {
  mod: #(p, n) {
    ? do it w/o { eval }
    fix nativeModRet = eval(`p % n`)
    if(nativeModRet < 0) {
      -> nativeModRet + n
    }
    else {
      -> nativeModRet
    }
  }
})

spec {
  using(Self)
  assert((-12).mod(5) == 3)
  assert((12).mod(5) == 2)
}
