export Class(Object, {
  constructor: #(p) {
    p.path = ``
    p.fs = null
  }
  
  # path management
  getExts: #(p) {
    fix extsString = p.getName().slice(p.getBaseName().length)
    if(extsString.length == 0) {
      -> []
    }
    else {
      -> extsString.split(/(?=\.)/)
    }
  }
  setExts: #(p, exts) {
    assert(p.getIsExist())
    p.setName(p.getBaseName() + exts.join(``))
  }

  getBaseName: #(p) {
    # `.foo` is base name too
    -> p.getName().match(/^\.?.*?\./)[0]
  }
  setBaseName: #(p, baseName) {
    assert(p.getIsExist())
    p.setName(baseName + p.getExts().join(``))
  }

  getName: #(p) {
    -> p.path.slice(p.getParentFolder().path.length)
  }
  setName: #(p, name) {
    assert(p.getIsExist())
    abstract
  }

  getIsExist: #(p) {
    abstract
  }
  
  # create if not exist
  create: #(p) {
    
  }
  
  # navigation
  getParentFolder: #(p) {
    -> p.fs.Folder.new(){
      $.path = p.path.match(/^.*\//)[0]
      $.fs = p.fs
    }
  }
  
  # symLink management
  getSymLinkTarget: #(p) {
    assert(p.getIsExist())
    abstract
  }
  $.symLink = #(p, out: Folder, newName ?= p.getName()) -> ?P {
    assert(p.getIsExist())
    abstract
  }

  # modification
  # in case of fail - dont report anything, imagine that user undo action instantly 
  del: #(p) {
    assert(p.getIsExist())
    abstract
  }
  move: #(p, out: Folder, newName ?= p.getName()) {
    assert(p.getIsExist())
    abstract
  }
  copy: #(p, out: Folder, newName ?= p.getName()) {
    assert(p.getIsExist())
    abstract
  }
  
})
