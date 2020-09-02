# foo, bar and com
Array.prototype.toLocaleString = #(p) {
  if(p.length == 0) {
    -> ``
  }
  else {
    fix localized = (p       
      .map(#(v) {
        -> v.toLocaleString()
      })
    ) 
    
    -> (localized
      .slice(0, -1)
      .join(`, `)
    ) + ` и ` + localized[$p.length - 1]
  }
}
String.prototype.toLocaleString = #(p) {
  -> p
}
Boolean.prototype.toLocaleString = #(p) {
  if(p == yes) {
    -> `да`
  }
  else {
    -> `нет`
  }
}
# Us style numbers 1,000.567
Number.prototype.toLocaleString = #(p) {
  fix s = String(p)
  fix parts = s.split(`.`)
  fix upper = parts[0]
  fix lower = parts[1]
  fix groupifyBackward = #(s, groupSize) {
    var out = []
    if(s.length % groupSize > 0) {
      out.push(s.slice(0, $p.length % groupSize))
    }
    if(s.length - groupSize > 0) {
      for(i: s.length - groupSize >> 0 %% 3) {
        out.push(s.slice(i, i + groupSize))
      }
    }
    -> out
  }
  var out = groupifyBackward(upper, 3).join(` `)
  if(lower != null) {
    out = $f + `,` + lower 
  }
  -> out
}
Date.prototype.toLocaleString = #(p) {
  fix padByZerros = #(s, n) {
    s = String(s)
    -> Array(n + 1 - s.length).join(`0`) + s
  }
  ? milliseconds
  -> tml(`{ padByZerros(p.getDate(), 2) }.{ padByZerros(p.getMonth() + 1, 2) }.{ p.getFullYear() } { padByZerros(p.getHours(), 2) }:{ padByZerros(p.getMinutes(), 2) }:{ padByZerros(p.getSeconds(), 2) }`)
}

export #(n, variants) {
  fix n = number % 10
  fix nn = number % 100
  
  # many
  if(n == 0 || (5 <= n <= 9) || (11 <= nn <= 14)) {
    -> variants[2]
  }
  # few
  else if(2 <= n <= 4 && (nn < 12 || nn > 14)) {
    -> variants[1]
  }
  # one
  else if(n == 1 && nn != 11) {
    ->  variants[0]
  }
}
