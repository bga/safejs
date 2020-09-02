fix Path = require(`path`)
export #(path) {
  # win style
  if(Path.sep == `\`) {
    # drive
    if(path.match(/^\/\w:/)) {
      path = $f.slice(1)
    }
    -> path.replace(/\//g, `\`)
  }
  # unix style
  else {
    -> path
  }
}
