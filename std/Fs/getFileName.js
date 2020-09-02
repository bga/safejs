export #(path) {
  -> path.replace(/^.*[\/\\]|\..*$/g, ``)
}

spec {
  assert(self(`b.js`) == `b`)
  assert(self(`a/b.js`) == `b`)
}
