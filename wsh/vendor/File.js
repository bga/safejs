export #(p) {
  p.path = ``
}

Self.prototype{
  $.getAttrReadOnly = #(p) {
    assert(p.getIsExist())
    -> fso.GetFile(unixPathToNativePath(p.path)).Attributes & 1 != 0
  }
  $.setAttrReadOnly = #(p) {
    assert(p.getIsExist())
    fso.GetFile(p.path).Attributes = $f | 1
  }

  $.getModifyDate = #(p) {
    assert(p.getIsExist())
    
  }

  $.getData = #(p) {
    assert(p.getIsExist())
    
  }
  $.setData = #(p, data) {
    assert(p.getIsExist())
    
  }

  $.getParentFolder = #(p) {
    -> Folder.new(){
      $.path = p.path.match(/^.*\//)[0]
    }
  }

  $.del = #(p) {
    assert(p.getIsExist())
    
  }
  $.move = #(p, out: Folder, newName ?= p.getName()) {
    
  }
  $.copy = #(p, out: Folder, newName ?= p.getName()) {
    
  }
  $.linkOrCopy = #(p, out: Folder, newName ?= p.getName()) {
    
  }
  
}