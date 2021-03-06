# [http://www.webtoolkit.info/javascript-utf8.html]
export Class(Object, {
  constructor: #(p) {
    p.bytes = ``
  }
  genFromString: #(p, s) {
    -> Self.new(){
      $.bytes = s.replace(/[\x80-\xFFFF]/g, #(char) {
        fix c = char.charCodeAt(0)
        if(c < 2048) {
          -> String.fromCharCode((c >> 6) | 192, (c & 63) | 128)
        }
        else {
          -> String.fromCharCode((c >> 12) | 224, ((c >> 6) & 63) | 128, (c & 63) | 128)
        }
      })
    }
  }
  toString: #(p) {
    var string = ``

    var i = 0
    loop {
      if(i >= p.bytes.length) {
        break
      }
      fix c = p.bytes.charCodeAt(i)
      if (c < 128) {
        string += String.fromCharCode(c)
        i = $f + 1
      }
      else if(191 < c < 224) {
        assert(i + 1 < p.bytes.length)
        fix c2 = p.bytes.charCodeAt(i + 1)
        string += String.fromCharCode(((c & 31) << 6) | (c2 & 63))
        i = $f + 2
      }
      else {
        assert(i + 2 < p.bytes.length)
        fix c2 = p.bytes.charCodeAt(i + 1)
        fix c3 = p.bytes.charCodeAt(i + 2)
        string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63))
        i = $f + 3
      }
    }
    -> string
  }  
}) 

spec {
  [``, `1`, `a23`, `������ ���`].forEach(#(s) {
    assert(Self.new().genFromString(s).toString() == s)
  })
}