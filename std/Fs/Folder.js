export Class(FsItem, {
  constructor: #(p) {
  }
  getFiles: #(p) {
    assert(p.getIsExist())
    abstract
  }
  getFolders: #(p) {
    assert(p.getIsExist())
    abstract
  }
})
