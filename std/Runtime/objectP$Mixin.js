export mixin(Object, {
  p$: #(p, f) {
    -> f(p)
  }
})

spec {
  using(Self)
  assert(({ b: yes }).p$(#(a) {
    -> a.b
  }))
}
