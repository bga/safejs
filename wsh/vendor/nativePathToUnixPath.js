export #(path) {
  # drive
  if(path.match(/^\w:/)) {
    path = `/` + path 
  }
  -> path.replace(/\\/g, `/`)
}
