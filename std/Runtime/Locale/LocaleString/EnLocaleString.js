using(stringMixin)

export Class(LocaleString, {
  
  constructor: #(p) {
    p.digitsCountPerGroup = 3
    p.digitsGroupSeparator = `,`
    p.integerAndFractionPartsSeparator = `.`
    p.realNumberFormat = `99_999.99`
    p.integerNumberFormat = `9`
    p.romanDigitToV = {
      `K`: 5_000
      `M`: 1_000
      `D`: 500
      `C`: 100
      `L`: 50
      `X`: 10
      `V`: 5
      `I`: 1
    }
  }
  
  genFromCommandLineArgs: #(p) {
    
  }
  parseCommandLineArgs: #(p) {
    
  }
  
  parseConfig: #(p) {
    ? future stuff, just mark relation of locale and config format
  }
  
  # yes/no
  genFromBoolean: #(p, b) {
    -> Self.new(){
      if(b == yes) {
        $.s = `yes`
      }
      else {
        $.s = `no`
      }
    }
  }
  parseBoolean: #(p) {
    if(p.s == `yes`) {
      -> yes
    }
    else if(p.s == `no`) {
      -> no
    }
    else {
      -> null
    }
  }
  
  # Us style numbers 1,000.567
  genFromRealNumber: #(p, n) {
    using(mixin(String, {
      getDecimalPointDigitsInterval = #(p) {
        branch {
          with fix nonPaddedMatch = p.match(/^(9+)$/)
          case(nonPaddedMatch != null) {
            $r = [1, nonPaddedMatch[1].length]
          }
          with fix paddedMatch = p.match(/^(0+)$/)
          case(paddedMatch != null) {
            $r = [paddedMatch[1].length, paddedMatch[1].length]
          }
          else {
            error()
          }
        }
      }
    }))
    
    fix formatMatch = p.realNumberFormat.replace(/_/g, ``).match(/^(\+?)(9+|0+)\.(9+|0+)$/)
    assert(formatMatch != null)
    fix isOptionalSign = formatMatch[1].length > 0
    
    fix integerPartDigitsInterval = formatMatch[2].getDecimalPointDigitsInterval()
    fix fractionPartDigitsInterval = formatMatch[3].getDecimalPointDigitsInterval()
    branch {
      case(n == 0) {
        
      }
      # overflow
      case(10 ** integerPartDigitsInterval[1] <= n) {
        fix adjustedbeforeDecimalPointDigitsCount = {
          $r = (n.abs().ln() / (10).ln()).ceil()
        }
      }
      # underflow
      case(n.abs() < 10 ** -fractionPartDigitsInterval[1]) {
        
      }
      else {
        branch {
          case(n == 0) {
            $r = `0`.
          }
          else {
            fix beforeDecimalPointDigitsCount = (n.abs().ln() / (10).ln()).floor
          }
        }
      }
    }
    fix s = n.toString()
    -> Self.new(){
      $r.s = ({
        branch {
          case(isOptionalSign) {
            $r = ``
          }
          case(n > 0) {
            $r = `+`
          }
          else {
            $r = `-`
          }
        }
        .concat(Math.floor(n).toString().groupifyFromLastKey(3).join(`,`))
        .concat(`.`)
        .concat(Math.round((n % 1) * 10 ** fractionPartDigitsInterval[1]))
      )
      $.s = String(n).replace(/^-?\d+(?=\.|$)/, #(upper) {
        -> upper.groupifyBackward(3).join(`,`)
      })
    }
  })
  parseNumber: #(p) {
    # roman style
    if(p.match(RegExp(`^[` + Object.keys(p.romanDigitToV) + `]+$`)) {
      fix digits = p.s.split(``)
      var sum = 0
      var i = 0
      loop {
        if(i == digits.length) {
          break
        }
        if(i < digits.length - 1 && digitToV[digits[i]] < digitToV[digits[i + 1]]) {
          sum = $f + digitToV[digits[i + 1]] - digitToV[digits[i]] 
          i = $f + 2
        }
        else {
          sum = $f + digitToV[digits[i]]
          i = $f + 1
        }           
      }
      $r = sum
    }
    else if(p.s.match(/^-?[\d,]+(\.\d+([eE]-?\d+))?$/)) {
      $r = nativeGlobal.parseFloat(p.s.replace(/,/g), ``)
    }
    else {
      $r = null
    }
  }
  
  genFromDate: #(p) {
    $r = Self.new(){
      $r.s = {
        compile tmlDsl(`{ p.getFullYear() }.{ String(p.getMonth() + 1).padLeft(`0`, 2) }.{ String(p.getDate()).padLeft(`0`, 2) } { String(p.getHours()).padLeft(`0`, 2) }:{ String(p.getMinutes()).padLeft(`0`, 2) }:{ String(p.getSeconds()).padLeft(`0`, 2) }`)
      }
    }
  }
  parseDate: #(p) {
    fix m = p.s.match(/^(\d+)\.(\d+).(\d+)[ ]$/)
  }
  
  genPluralForm: #(variants, n) {
    if(n == 1) {
      -> variants[0]
    }
    else {
      -> variants[1]
    }
  }
}
  

example {
  var localeString = Self.new()
  assert(localeString.genFromBoolean(yes) == `yes`)
  assert(localeString.genFromBoolean(no) == `no`)
  assert(localeString.genFromRealNumber(1_000.23) == `1,000.23`)
  assert(localeString.genFromDate(new Date(2003, 2, 3, 12, 1, 34)) == `2003.03.03 12:01:34`)
  assert(localeString.genFromArray([1_000, 2.3, yes]) == `1,000, 2.3 and yes`)
  assert(localeString.genPluralForm([`apple`, `apples`], 1) == `apple`)
  assert(localeString.genPluralForm([`apple`, `apples`], 0) == `apples`)
}