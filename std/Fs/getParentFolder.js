export #(path) {
  -> path.match(/^.*\//)[0]
}
spec {
  assert(self(`a/b`) == `a/`)
  assert(self(`c/a/b.js`) == `c/a/`)
}
