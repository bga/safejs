export (nativeGlobal.document.location.toString()
  .replace(/#.*$/, ``)
  .replace(/\?.*$/, ``)
  .match(/^.*\//)[0]
)