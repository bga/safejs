export #(commandLineOptions, def) {
  using(mixin(String, {
    isDoc: #(p) {
      -> p.match(/Doc\$$/) != null
    }
    dasherize: #(p) {
      -> p.replace(/[A-Z]/g, #(letter) {
        -> eval(tml(`-{ letter.toLowerCase() }`))
      })
    }
    toCliArg: #(p) {
      -> `--` + p.dasherize()
    }
  }))
  fix apiKeys = (Object.keys(def)
    .filter(#(name) {
      -> name.match(/^[a-z]/) && name.!isDoc()
    })
  )
  
  var i = 0
  loop {
    if(i == commandLineOptions.length) {
      break
    }
    
    i = $f + 1
  }
}

spec {
  fix def = {
    # some string
    `a`: `hi`
    # some z
    `b`: 0
    # some f
    `sum`: #(p) {
      p.a = $f + p.b
    }
  }
  assert(self(`--a=hey --b=1 --sum`, def).restPos == 3 && def.a == `hey1`)
  
}