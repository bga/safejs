var exportConst = function(v) {
  return v
}
var win = window
var doc = document
var root = doc.documentElement
var yes = !0, no = !1

var isTop = no
try {
  isTop = !win.frameElement
}
catch(e) {
}

var doScrollFix = ((isTop && exportConst(doc.createEventObject && root.doScroll)) && function() {
    try {
      doc.documentElement.doScroll('left')
    }
    catch(err) {
      return no
    }
    return yes
  }
  || null
)  

var isLoadedPart = function() {
  //# stupid opera
  if(exportConst('readyState' in doc)) {
    return doc.readyState == 'loaded' || doc.readyState == 'complete'
  }
  else {
    return doc.body
  }
}

var isLoaded = function() {
  return isLoadedPart() && ((doScrollFix) ? doScrollFix() : yes)
}

var attachEvent = function(v, type, fn) {
  if(exportConst(doc.addEventListener)) {
    v.addEventListener(type, fn, no)
  }
  else if(exportConst(doc.attachEvent)) {
    v.attachEvent('on' + type, fn)
  }
  else {
    var old = v['on' + type]
    v['on' + type] = function() {
      try {
        old.apply(null, arguments)
      }
      catch(err) {
      }
      fn.apply(null, arguments)
    }
  }
}

var eventType = (exportConst('readyState' in doc) && 'readystatechange'
  || exportConst(doc.addEventListener) && 'DOMContentLoaded'
  || null
)

var isReadyEventAttached = no
var isReady = no
var listeners = []

var fireListeners = function() {
  var i = -1; while(++i < listeners.length) {
    listeners[i]()
  }
  listeners = null
}

var poll = function() {
  if(isLoaded()) {
    onReady()
  }
  else {
    setTimeout(poll, 50)
  }
}

var onReady = function() {
  isReady = yes
  fireListeners()
}

var attachReadyEvent = function(fn) {
  if(isReadyEventAttached) {

  }
  else {
    if(eventType && doScrollFix == null){
      attachEvent(doc, eventType, function() {
        if(isLoaded()) {
          onReady()
        }
      })
    }
    else {
      poll()
    }
  }
  isReadyEventAttached = yes
}

exports._ = function(fn) {
  //debugger
  if(isReady) {
    fn()
  }
  else {
    if(isLoaded()) {
      isReady = yes
      fn()
    }
    else {
      attachReadyEvent()
      listeners.push(fn)
    }
  }
}