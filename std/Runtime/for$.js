# new version
? old version has { assert(begin <= end) }
export #(range, f) {
  fix begin = range[0]
  fix end = range[2]
  fix step = range[4] || 1
  
  assert(step >= 0)
  fix shift = nativeGlobal.Math.abs(end - begin) % step 
  if(shift > 0) {
    if(begin <= end) {
      end = $f + step - shift
    }
    else {
      end = $f + shift - step
    }
  }
  if(range[1] == `<<`) {
    begin = $f - step
    end = $f - step
    begin <-> end
  }
  if(begin >= end) {
    step = -$f
  }
  for(var i = begin; i != end; i += step) {
    f(i)
  }
}

spec {
  fix isArrayEq = #(b, d) {
    if(b.length != d.length) {
      -> no
    }
    else {
      var i = 0
      loop {
        if(i == b.length) {
          break
        }
        if(b[i] != d[i]) {
          break
        }
        i = $f + 1
      }
      -> i == b.length
    }
  }
  
  var a = []
  self([0, `>>`, 12, `%%`, 3], #(i) {
    a.push(i)
  })
  assert(isArrayEq(a, [0, 3, 6, 9]))

  var a = []
  self([1, `<<`, 5, `%%`, 3], #(i) {
    a.push(i)
  })
  assert(isArrayEq(a, [4, 1]))

  var a = []
  self([-1, `>>`, -6, `%%`, 3], #(i) {
    a.push(i)
  })
  assert(isArrayEq(a, [-1, -4]))
}

