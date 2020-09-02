export mixin(Object, {
  toObject: #(p) {
    -> p
  }
})

spec {
  using(Self)
  assert(typeof(``.toObject()) == `object`)
}
