fix shell = new nativeGlobal.ActiveXObject(`WScript.Shell`)
export nativePathToUnixPath(shell.CurrentDirectory) + `/`
