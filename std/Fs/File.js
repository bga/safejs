export Class(FsItem, {
  constructor: #(p) {
  }
  getAttrReadOnly: #(p) {
    assert(p.getIsExist())
    abstract
  }
  setAttrReadOnly: #(p) {
    assert(p.getIsExist())
    abstract
  }

  getModifyDate: #(p) {
    assert(p.getIsExist())
    abstract
  }

  getData: #(p) {
    assert(p.getIsExist())
    abstract
  }
  setData: #(p, data) {
    assert(p.getIsExist())
    abstract
  }
})
