export mixin(Array, {
  getLest: #(p) {
    -> p[p.length - 1]
  }
})