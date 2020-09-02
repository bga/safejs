export #(p) {
  p.path = ``
  p.fs = null
}

Self.prototype{
  # path management
  $.getExts = #(p) {
    fix extsString = p.getName().slice(p.getBaseName().length)
    if(extsString.length == 0) {
      -> []
    }
    else {
      -> extsString.split(/(?=\.)/)
    }
  }
  $.setExts = #(p, exts) {
    p.setName(p.getBaseName() + exts.join(``))
  }

  $.getBaseName = #(p) {
    # `.foo` is base name too
    -> p.getName().match(/^\.?.*?\./)[0]
  }
  $.setBaseName = #(p, baseName) {
    p.setName(baseName + p.getExts().join(``))
  }

  $.getName = #(p) {
    -> p.path.slice(p.getParentFolder().path.length)
  }
  $.setName = #(p, name) {
    abstract
  }

  $.getIsExist = #(p) {
    abstract
  }
  
  # navigation
  $.getParentFolder = #(p) {
    -> p.fs.Folder.new(){
      $.path = p.path.match(/^.*\//)[0]
    }
  }
  
  # symLink management
  $.getSymLinkTarget = #(p) {
    abstract
  }
  $.symLink = #(p, out: Folder, newName ?= p.getName()) -> ?P {
    abstract
  }

  # modification
  # in case of fail - dont report anything, imagine that user undo action instantly 
  $.del = #(p) {
    abstract
  }
  $.move = #(p, out: Folder, newName ?= p.getName()) {
    abstract
  }
  $.copy = #(p, out: Folder, newName ?= p.getName()) {
    abstract
  }
}