fix Fs = require(`fs`)
export #(path) {
  try {
    -> Fs.readFileSync(unixPathToNativePath(path), `utf8`)
  }
  catch(err) {
    -> null
  }
}