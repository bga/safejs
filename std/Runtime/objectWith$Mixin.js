export mixin(Object, {
  with$: #(p, f) {
    f(p)
    -> p
  }
})

spec {
  using(Self)
  assert(Array().with$(#(a) {
    a.push(1)
  })[0] == 1)
}
