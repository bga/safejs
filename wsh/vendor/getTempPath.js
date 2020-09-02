fix fso = new nativeGlobal.ActiveXObject(`Scripting.FileSystemObject`)
export #(ext ?= ``, prefix ?= ``) {
  fix tempPath = nativePathToUnixPath(fso.GetSpecialFolder(2) + `\`)
  var i = 0
  var path
  loop {
    path = tempPath + prefix + i + ext
    if(!fso.FileExist(path)) {
      break
    }
    i = $f + 1
  }
  -> path
}
