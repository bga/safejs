fix fso = new nativeGlobal.ActiveXObject(`Scripting.FileSystemObject`)

export #(path) {
  path = unixPathToNativePath(path)
  using(cp866ConvertStringMixin)
  assert(fso.FileExists(path))
  var stream = new nativeGlobal.ActiveXObject(`ADODB.Stream`)
  stream.type = 2
  stream.Charset = `cp866`
  stream.Open()
  stream.LoadFromFile(path)
  fix GetFile = stream.ReadText()
  stream.Close()
  -> GetFile.asUnicodeToCp866()
}
