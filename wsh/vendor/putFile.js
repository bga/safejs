fix fso = new nativeGlobal.ActiveXObject(`Scripting.FileSystemObject`)

fix makeDir = #(path) {
  path = unixPathToNativePath(path)
  fix parts = path.split(`\`)
  assert(parts.length > 0)
  # skip disk
  var i = 1
  loop {
    if(i == parts.length + 1) {
      break
    }
    if(!fso.FolderExists(parts.slice(0, i).join(`\`))) {
      break
    }
    i  = $f + 1
  }
  if(i < parts.length + 1) {
    for(j: i >> parts.length + 1) {
      fso.CreateFolder(parts.slice(0, j).join(`\`))
    }
  }
}

export #(path, data) {
  using(cp866ConvertStringMixin)
  makeDir(fso.GetParentFolderName(path))
  path = unixPathToNativePath(path)
  var stream = new nativeGlobal.ActiveXObject(`ADODB.Stream`)
  stream.type = 2
  stream.Charset = `cp866`
  stream.Open()
  stream.WriteText(data.asCp866ToUnicode(), 0)
  stream.SaveToFile(path, 2)
  stream.Close()
}

spec {
  fix data = Array.new(){
    for(i: 0 >> 256) {
      $.push(String.fromCharCode(i))
    }
  }.join(``)
  fix path = getTempPath()
  self(path, data)
  assert(getFile(path) == data)
}