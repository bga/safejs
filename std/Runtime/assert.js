export #(expr, msg) {
  if(!expr) {
    throw nativeGlobal.Error(msg)
  }
}
