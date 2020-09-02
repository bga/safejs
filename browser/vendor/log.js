var consoleWindow = null
export function() {
  if(Global.console) {
    Function.prototype.apply.call(console.log, console, arguments)
  }
  else if(Global.opera && Global.opera.postError) {
    Global.opera.postError([].join.call(arguments, ` `))
  }
  else {
    if(consoleWindow == null) {
      consoleWindow = open(``, `log`)
      consoleWindow.document.open(`text/html`)
      consoleWindow.document.write(`
        <html>
          <title>log</title>
          <style>
            * { 
              padding: 0; 
              margin: 0; 
            } 
            pre { 
              border: 1px dashed black; 
              margin: 2px; 
            }
          </style>
        <body>
        </body>
      </html>`
    )
      consoleWindow.document.close()
    }
    (consoleWindow.document.body.appendChild(consoleWindow.document.createElement(`pre`))
      .appendChild(consoleWindow.document.createTextNode([].join.call(arguments, ` `)))
    )
  }
}
