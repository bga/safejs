export mixin(String, {  asUnicodeStringToWideString: #(p) {    -> p.replace(/[\s\S]{2}/g, #(pair) {      -> String.fromCharCode(pair.charCodeAt(0) + pair.charCodeAt(1) * 2 ** 8)    })  }  asWideStringToUnicodeString: #(p) {    -> p.replace(/[\s\S]/g, #(char) {      -> String.fromCharCode(char.charCodeAt(0) & 0xFF, char.charCodeAt(0) >>> 8)    })  }})