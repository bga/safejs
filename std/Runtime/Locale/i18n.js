using(fnMixin)

# bit dirty until we do not have real caching everywhere
using(mixin(I18nDb, {
  compileTranslation: #(p, dbKey) {
    branch {
      case(p.traslations[dbKey].cachedSourceOfFn == null) {
        fix engTemplate = i18nDb.traslations[dbKey].engTemplate
        fix tranlationTemplate = i18nDb.traslations[dbKey].tranlationTemplate
        fix permutation = engTemplate.getPermuattionBetweenTemplates(tranlationTemplate)
        fix permutate = (`[` 
          + (permutation
            .map(#(i) {
              -> `arguments[` + i + `]`
            })
            .join(`, `)
          ) 
          + `]`
        )
        p.traslations[dbKey].cachedSourceOfFn = `function(){ (` + tranlationTemplate.compile() + `).apply(null, ` + permutate + `) }`
      }
      else {
        
      }
    }
    -> p.traslations[dbKey].cachedSourceOfFn
  }
}))

using(utf8ConvertStringMixin)

export #(s) {
  fix frame = arguments.callee.caller$.getModuleFrame()
  assert(frame != null)
  if(frame.i18nDb$ == null) {
    fix i18nFile = getFile(frame.modulePath.match(/^(.*)\..*?$/)[1] + `.locales/` + locale.toLowerCase() + `/tranlations.txt`)
    frame.i18nDb$ = I18nDb.new().parseFromString((i18nFile || ``).asUtf8ToUnicode())
  }
  fix engTemplateWithRealHostExprs = I18nTemplate.new().parseFromString(s)
  fix dbKey = engTemplateWithRealHostExprs.getDbKey()
  fix sourceOfFn
  if(dbKey in frame.i18nDb$.traslations) {
    sourceOfFn = frame.i18nDb$.compileTranslation(dbKey)
  }
  else {
    sourceOfFn = engTemplateWithRealHostExprs.compile()
  }
  fix sourceOfApply = (engTemplateWithRealHostExprs.tokens
    .filter(#(token) {
      when(token) {
        is(I18nTemplateHostExpr | I18nTemplateHostExprWithSubject) {
          -> yes
        }
        is(I18nTemplateRawText) {
          -> no
        }
      }
    })
    .map(#(hostExpr) {
      -> hostExpr.expr
    })
    .join(`, `)
  )
  -> `(` + sourceOfFn + `)(` + sourceOfApply + `)`
}


/*
(#() { -> "".concat("Hi ", arguments[0].toLocalString(), ", you have ", arguments[1].toLocalString(), " ", arguments[1].getPluralForm(["apple", "apples"])) })(name, count)

with({ i18nFn$: i18nFn$ }) i18nFn$(name, count)
// eval(i18n("Hi { name }, you have { count } <[apples]"))

!#(foo) {
  compile bar(`foo = (%= foo %)`)
}

!#(foo) {
  eval($self.cache || ($self.cache = bar(`foo = (%= foo %)`)))
}

!#(foo) {
  eval(compile$(function() { return bar(`foo = (%= foo %)`) }))
}

export compile$ = #(calcExpr) {
  fix caller = arguments.callee.caller
  if(caller.cache$ == null) {
    caller.cache$ = calcExpr()
  }
  -> caller.cache$
}
*/