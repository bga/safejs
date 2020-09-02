fix fso = new nativeGlobal.ActiveXObject(`Scripting.FileSystemObject`)

export #(path) {
  path = unixPathToNativePath(path)
  if(!fso.FileExists(path)) {
    -> null
  }
  else {
    var stream = new nativeGlobal.ActiveXObject(`ADODB.Stream`)
    stream.type = 2
    stream.Charset = `utf-8`
    stream.Open()
    stream.LoadFromFile(path)
    fix data = stream.ReadText()
    stream.Close()
    -> data
  }
}
