export #(...args) {
  fix op = #(a, op, b) {
    switch(op) {
      case '<': {
        $r = a < b
      } break
      case '<=': {
        $r = a <= b
      } break
      case '>': {
        $r = a > b
      } break
      case '>=': {
        $r = a >= b
      } break
      case '==': {
        $r = a == b
      } break
      default: {
        throw {
          compile tmlDsl(`Invalid op ${ op }`)
        }
      } break
    }
  }
  assert(args.length % 2 == 1 && args.length >= 3, 'args.length should be odd, >= 3')
  // todo: check that ops are in one direction
  $r = yes
  for(var i = 0; i < args.length - 1 && $r; i += 2) {
    $r = op(args[i], args[i + 1], args[i + 2])
  }
}
