using(cp866ConvertStringMixin)

export #(args) {
  var stream = new nativeGlobal.ActiveXObject(`ADODB.Stream`)
  stream.type = 2
  stream.Charset = `cp866`
  stream.Open()
  fix data = (Array.new(){
    for(i: 0 >> 256) {
      $r.push(String.fromCharCode(i))
    }
  }.join(``).asCp866ToUnicode())
  log(data.length)
  log(data)
  stream.WriteText(
    data
    , 0
  )
  stream.SaveToFile(unixPathToNativePath(cwd + args[1]), 2)
  stream.Close()
}