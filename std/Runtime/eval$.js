using(mixin(Fn, {
  getName: #(p) {
    -> p.toString().match(/.*/)[0].match(/function\s+(.*?)\(/)[1]
  }
}))
export #(s, lineNumber, realEval) {
  fix pName = arguments.callee.caller$.getName()
  s = Compiler.compile(s, [Compiler.curry(Compiler.addDebugInfo, [pName])], Compiler.JsStringLiteralAndCommentCoder.new())
  try {
    Fn(s)
  }
  catch(err) {
    if(err instanceof nativeGlobal.SyntaxError) {
      throw new nativeGlobal.SyntaxError(getSyntaxError(s))
    }
    else {
      throw err
    }
  }
  -> realEval(s)
}