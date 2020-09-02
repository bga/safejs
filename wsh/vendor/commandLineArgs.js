export (function() {
  var out = []
  var i = -1; while(++i < nativeGlobal.WScript.Arguments.Length) {
    out.push(nativeGlobal.WScript.Arguments.Item(i))
  }
  out.unshift(nativePathToUnixPath(nativeGlobal.WScript.ScriptFullName))
  return out
})()
