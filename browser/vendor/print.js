? support Notification
export #(s) {
  var doc = nativeGlobal.document
  var textElement = doc.body.appendChild(doc.createElement(`pre`))
  //textElement.contenteditable = yes
  textElement.tabIndex = 0
  textElement.appendChild(doc.createTextNode(s))
} 
