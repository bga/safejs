export mixin(Number, {
  pow: #(p, n) {
    -> Math.pow(p, n)
  }
})

spec {
  using(Self)
  assert((2).pow(3) == 8)
}
