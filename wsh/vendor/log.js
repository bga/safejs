export #(...args) {
  nativeGlobal.WScript.StdErr.WriteLine(args.join(`, `))
} 
