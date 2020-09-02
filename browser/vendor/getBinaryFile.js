fix ActiveXObject = nativeGlobal.ActiveXObject

# [http://stackoverflow.com/questions/1919972/how-do-i-access-xhr-responsebody-for-binary-data-from-javascript-in-ie]
export #(path) {
  path = unixPathToNativePath(path)
  fix xhr = {
    if(ActiveXObject != null) {
      # should be supported or we just can not get binary data
      $r = new ActiveXObject(`Msxml2.XMLHTTP.3.0`)
    }
    if(nativeGlobal.XMLHttpRequest != null) {
      $r = new nativeGlobal.XMLHttpRequest()
    }
  }
  xhr.open(`GET`, path, no)
  if(xhr.overrideMimeType != null) {
    xhr.overrideMimeType(`text/plain; charset=x-user-defined`);
  }
  xhr.send()
  if(200 <= xhr.status < 300) {
    if(xhr.responseBody != null) {
      if(nativeGlobal.IEBinaryToArray_ByteStr == null) {
        nativeGlobal.execScript(`
          Function IEBinaryToArray_ByteStr(Binary)
            IEBinaryToArray_ByteStr = CStr(Binary)
          End Function
        `, `vbscript`)
      }
      using(wideStringMixin)
      $r = nativeGlobal.IEBinaryToArray_ByteStr(xhr.responseBody).asWideStringToUnicodeString()
    }
    else if(xhr.overrideMimeType != null) {
      $r = (xhr.responseText
        .split(``)
        .map(#(c) {
          -> c.charCodeAt(0) & 0xff
        })
        .join(``)
      )
    }
    else {
      throw `Reading binary data impossible`
    }
  }
  else {
    $r = null
  } 
}
