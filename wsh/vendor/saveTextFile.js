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
  makeDir(unixPathToNativePath(getParentFolder(path).slice(0, -1)))
  var stream = new nativeGlobal.ActiveXObject(`ADODB.Stream`)
  stream.type = 2
  if(data.split(``).some(#(char) {
    -> char.charCodeAt(0) >= 0x80
  })) {
    stream.Charset = `utf-8`
  }
  else {
    stream.Charset = `cp866`
  }
  stream.Open()
  stream.WriteText(data, 0)
  stream.SaveToFile(unixPathToNativePath(path), 2)
  stream.Close()
}