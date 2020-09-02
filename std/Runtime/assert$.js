export #(fileName, lineNo, expr, msg ?= ``) {
  assert(expr, `(` + fileName + `:` + lineNo + `) Assert failed:` + (msg || ``))
}