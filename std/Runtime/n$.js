export #(s) { 
  s = s.replace(/_/g, ``)
  if(/^0b/.test(s)) {
    -> nativeGlobal.parseInt(s.slice(2), 2)
  }
  else if(/^0x/.test(s)) {
    -> nativeGlobal.parseInt(s.slice(2), 16)
  }
  else {
    -> nativeGlobal.parseFloat(s)
  }
}

spec {
  assert(self(`1_000`) - 1000 == 0)
  assert(self(`0b1111_1111`) - 255 == 0)
  assert(self(`0x1_FFFF`) - 0x1FFFF == 0)
}