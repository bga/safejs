export #(OwnType, frameEnv) {
  if(OwnType.env$ == frameEnv) {
    -> OwnType
  }
  else {
    fix classNameMatch = {  }.toString.call(OwnType).match(/^\[object\s+(\w*)\]$/)
    if(classNameMatch != null) {
      fix className = classNameMatch[1]
      # real class name, not Ie6's `object`
      if(className.charAt(0).toUpperCase() == className.charAt(0) && className in nativeGlobal) {
        -> frameEnv[className]
      }
    }
    else {
      fix ownEnvNames = Object.getOwnPropertyNames(nativeGlobal)

      var i = 0
      loop {
        if(i >= ownEnvNames.length) {
          break
        }
        if(nativeGlobal[ownEnvNames[i]] == OwnType) {
          break
        }
        i = $f + 1
      }

      if(i >= ownEnvNames.length) {
        -> null
      }
      else {
        -> frameEnv[ownEnvNames[i]]
      }
    }
  }  
}