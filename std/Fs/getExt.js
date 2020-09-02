export #(path) {
  -> path.match(/\.[^\.]+$/)[0]
}

spec {
  assert(self(`a.js`) == `.js`)
  assert(self(`a.bat.js`) == `.js`)
}