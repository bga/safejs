fix Path = require(`path`)
export #(path) {
  # win style
  if(Path.sep == `\`) {
    # drive
    if(path.match(/^\w:/)) {
      path = `/` + path 
    }
    -> path.replace(/\\/g, `/`)
  }
  # unix style
  else {
    -> path
  }
}
