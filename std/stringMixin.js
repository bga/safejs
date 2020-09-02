export mixin(String, {
  compactSpaces: #(p) {
    -> p.replace(/\s+/g, ` `)
  }
  rep: #(p, n) {
    assert(n >= 0)
    var degree = p
    var out = ``
    loop {
      if(n == 0) {
        break
      }
      if(n & 1) {
        out = $f + degree 
      }
      n = $f >> 1
      degree = $f + $f
    }
    -> out
  }
  padLeft: #(p, fragment, maxLength) {
    assert(p.length <= maxLength)
    -> fragment.rep(Math.floor((maxLength - p.length) / fragment.length)) + p
  }
  padRight: #(p, fragment, maxLength) {
    assert(p.length <= maxLength)
    -> p + fragment.rep(Math.floor((maxLength - p.length) / fragment.length))
  }
  groupifyBackward: #(p, groupSize) {
    var out = []
    if(p.length % groupSize > 0) {
      out.push(p.slice(0, $p.length % groupSize))
    }
    if(p.length - groupSize > 0) {
      for(i: p.length - groupSize >> 0 %% groupSize) {
        out.push(p.slice(i, i + groupSize))
      }
    }
    -> out
  }
})