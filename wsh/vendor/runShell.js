fix WshShell = new nativeGlobal.ActiveXObject(`WScript.Shell`)

export #(shellCommand) {
  var nativeShell = WshShell.Exec(shellCommand)
  var shell = Shell.new(){
    
  }
  loop {
    if(!nativeShell.StdOut.AtEndOfStream) {
      shell.stdOut += nativeShell.StdOut.ReadAll() 
    }
    if(!nativeShell.StdErr.AtEndOfStream) {
      shell.stdErr += nativeShell.StdErr.ReadAll() 
    }
    if(nativeShell.Status == 1) {
      break
    }
    nativeGlobal.WScript.Sleep(100)
  }
  shell.exitCode = nativeShell.ExitCode
  -> shell
}