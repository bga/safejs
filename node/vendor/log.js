export #(...args) {
  nativeGlobal.process.stderr.write(args.join(', '))
} 
