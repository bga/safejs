var help = "node cMod.node.js inputFile outputFile"

require("./es5Shim.js")
var Compiler = require("./compile.js")
var fs = require("fs")
var Path = require("path")
var commandLineArgs = [].slice.call(process.argv, 1)
if(commandLineArgs.length == 0) {
  process.stdout.write(help)
}
else {
  try {
    var input = fs.readFileSync(Path.resolve(commandLineArgs[1]), "utf8")
    var compiledInput = ""
    with(Compiler) {
      compiledInput = compile(input, [
        //bindBreaksToLoops, 
        replace(/(\s)loop(\s)/g, '$1for(;;)$2'),
        expandAbbrs,

        replace(/(\s)->(\s)/g, '$1return$2'),
        curry(transformNumbers, [transformNumbers.release]), 
        curry(transformSwapOp, ["auto"]),
        curry(transformUserOp, [transformUserOp.asMethod]),
        transformImplication,
        //transformWith,
        //# line shift 
        curry(transformLinearComparsion, [transformLinearComparsion.release]),
        curry(transformPowOp, ["pow", "#include<math.h>\n"]),
        //? need template fn
        curry(fixModOp, ["mod", "#include<math.h>\n"]),
        transformCase, 
        transformVarInjectionStatic, 
        //transformSelf,
        //transformNot,
        //# C uses {  } for arrays
        //addBlindCommas,
        curry(asi, [[/\s+=\s+/, /\s(class|struct|enum|typedef|return|throw|break|goto)\s/]]), 
        transformF,
        curry(transformFor, [curry(transformFor.release, ["auto"])]),

        transformCDefine, 
        stripBlocks, 
        replace(/(\s)var(\s)/g, "$1auto$2"),
        replace(/(\s)fix(\s)/g, "$1auto const$2"),
        replace(/\$/g, '_')
      ], new CStringLiteralAndCommentCoder())
    }
    try {
      fs.writeFileSync(Path.resolve(commandLineArgs[2]), compiledInput, "utf8")
    }
    catch(err) {
      process.stdout.write("Can not write to " + (commandLineArgs[2] || "__skipped__"))
    }
  }
  catch(err) {
    process.stdout.write("Can not open " + (commandLineArgs[1] || "__skipped__"))
  }
}



