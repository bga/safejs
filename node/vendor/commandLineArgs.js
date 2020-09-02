export (#() {
  var args = [].slice.call(nativeGlobal.process.argv, 1)
  args[0] = nativePathToUnixPath($f)
})()
