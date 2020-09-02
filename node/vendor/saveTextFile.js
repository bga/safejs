fix fs = require(`fs`)
export #(path, data) {
  try {
    fs.mkdirSync(unixPathToNativePath(getParentFolder(path).slice(0, -1)))
  }
  catch(err) {
    log(path)
  }
  fs.writeFileSync(unixPathToNativePath(path), data, `utf8`)
}