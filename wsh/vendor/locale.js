export (#() {
  var shell = new nativeGlobal.ActiveXObject(`WScript.Shell`)
  var locale = shell.ExpandEnvironmentStrings(`%locale%`)
  if(locale != `%locale%`) {
    -> locale 
  }
  else {
    //fix objWMIService = nativeGlobal.GetObject(`winmgmts:{impersonationLevel=impersonate}!\\.\root\cimv2`)
    fix objWMIService = new nativeGlobal.ActiveXObject(`WbemScripting.SWbemLocator`).ConnectServer(`.`, `root\cimv2`)
    fix oss = objWMIService.ExecQuery(`Select * from Win32_OperatingSystem`)
    locale = null
    for(var e = new nativeGlobal.Enumerator(oss); !e.atEnd(); e.moveNext()) {
      fix os = e.item()
      fix localeCode = nativeGlobal.parseInt(os.Locale || os.get(`Locale`), 16)
      locale = Json.new().parseFromString(lcidToLangIdMapRes).data[localeCode & 0xFFFF]
      //log(os.get(`Locale`) + ``)
      -> locale
    }
  }
})()
