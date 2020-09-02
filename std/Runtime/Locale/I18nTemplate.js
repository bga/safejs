using(stringMixin)
using(mixin(String, {
  quote: #(p) {
    -> `"` + (p
      .replace(/\\/g, `\\`)
      .replace(/\"/g, `\"`)
      .replace(/\n/g, `\n`)
    ) + `"`
  }
}))

export Class(Object, {
  constructor: #(p) {
    p.tokens = []
  }

  parseFromString: #(p, s) {
    # curly brace excluding doubling which means escaping
    fix matchRE = /(\{(?!\{))/g 
    matchRE.lastIndex = 0
    var pos = 0
    var out = []
    var match
    while((match = matchRE.exec(s)) != null) {
      out.push(I18nTemplateRawText.new(){ 
        $.text = s.slice(pos, (pos = matchRE.lastIndex) - match[0].length).trim() 
      })
      fix q = s.indexOf(`}`, pos)
      fix hostExpr = s.slice(pos, q)
      # skip `}`
      q = $f + 1 
      # subject
      if(s.slice(q).trim().match(/^<\[/)) { 
        pos = s.indexOf(`<[`, q) + 2
        q = s.indexOf(`]`, pos)
        fix subject = s.slice(pos, q)
        out.push(I18nTemplateHostExprWithSubject.new(){ 
          $.expr = hostExpr.trim()
          $.subject = (subject
            .trim()
            .split(`,`)
            .map(#(word) {
              -> word.trim().compactSpaces()
            })
          )
        })
      }
      else {
        out.push(I18nTemplateHostExpr.new(){ 
          $.expr = hostExpr.trim() 
        }) 
      }
      pos = q
      matchRE.lastIndex = q
    }
    -> Self.new(){
      $.tokens = out
    }
  }

  compile: #(p) {
    fix argsOfConcat = []
    fix tokens = p.tokens
    for(i: 0 >> tokens.length) {
      fix token = tokens[i]
      when(token) {
        is(I18nTemplateRawText) {
          argsOfConcat = $f.concat([$.text.quote()])
        }
        is(I18nTemplateHostExpr) {
          argsOfConcat = $f.concat([`arguments[` + i + `].toLocaleString()`])
        }
        is(I18nTemplateHostExprWithSubject) {
          argsOfConcat = $f.concat([
            `arguments[` + i + `].toLocaleString$()` 
            ` `
            (`i18nDb.getPluralForm(arguments[` + i + `], [` 
              + ($.subject
                .map(#(word) {
                  -> word.quote()
                })
                .join(`, `)
              )
            + `])`)
          ])
        }
      }
    }
    -> `function() { return "".concat(` + argsOfConcat.join(`, `) + `) }`
  }

  getPermuattionBetweenTemplates: #(p, y) {
    fix leftTokens = p.tokens
    fix rightTokens = y.tokens
    fix getOnlyHostExprs = #(tokens) {
      -> tokens.filter(#(token) {
        when(token) {
          is(I18nTemplateHostExpr | I18nTemplateHostExprWithSubject) {
            -> yes
          }
          else {
            -> no
          }
        }
      })
    }
    fix leftHostExprs = getOnlyHostExprs(leftTokens)
    fix rightHostExprs = getOnlyHostExprs(rightTokens)
    -> leftHostExprs.map(#(leftToken) {
      ? requires { Array#find }
      -> rightHostExprs.find(#(token) {
        $r = token.expr == leftHostExprs[i].expr
      })
    })
  }

  getDbKey: #(p) {
    -> (p.tokens
      .map(#(token) {
        when(token) {
          is(I18nTemplateHostExpr) {
            -> `{}`
          }
          is(I18nTemplateHostExprWithSubject) {
            -> `{} <[` + $.subject + `]`
          }
          is(I18nTemplateRawText) {
            -> $.text
          }
        }
      })
      .join(` `)
    )
  }
})



