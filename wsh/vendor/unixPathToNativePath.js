export #(path) {
  # drive
  if(path.match(/^\/\w:/)) {
    path = $f.slice(1)
  }
  -> path.replace(/\//g, `\`)
}
