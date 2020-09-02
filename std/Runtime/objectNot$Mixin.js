export mixin(Object, {
  not$: #(p, f) {
    -> !f(p)
  }
})

spec {
  using(Self)
  assert(({ b: no }).not$(#(a) {
    -> a.b
  }))
}
