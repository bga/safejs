? i18n all

var help = `
  LOADER build.js [--keep-spec] [--add-debug-info] modulePath outputPath
    --keep-spec: transform spec to { if(isSpecTest$) }, create { isSpecTest$ = 0 } at top of build
    --add-debug-info: add module name and line to { log }/{ assert }/ fn name
`

var isKeepSpec = no
var isAddDebugInfo = no

fix sortHelper = #(isLess) {
  -> #(a, b) {
    if(isLess(a, b)) {
      -> 1
    }
    else if(isLess(b, a)) {
      -> -1
    }
    else {
      -> 0
    }
  }
}
fix indent = #(s, w) {
  -> s.replace(/^/mg, Array(w + 1).join(` `))
}
fix trimEnd = #(s) {
  -> s.replace(/\s+$/g, ``)
} 
fix memo = #(f) {
  var cache = {  }
  -> #(p, a) {
    if(cache.hasOwnProperty(a)) {
      -> cache[a]
    }
    else {
      -> cache[a] = f.apply(p, [a])
    }
  }
}
fix Module = #(p) {
  p.name = ``
  p.source = ``
  p.dependencies = []
}
fix build = #(topModulePath) {
  fix getTransforms = #(moduleName) {
    var extraTransforms = []
    if(`fnLinkMixin usingOrInstall mixin using`.split(/\s+/).indexOf(fileName) == -1) {
      extraTransforms.push(Compiler.addFnLinking)
    }
    if(isKeepSpec) {
      extraTransforms.push(Compiler.transformSpec)
    }
    else {
      extraTransforms.push(#(s) {
        -> s.replace(/(\n[ ]*)spec(\s+)(\{[\s\S]*?\1\})/g, ``)
      })
    }
    if(isAddDebugInfo) {
      if("assert$ log$".split(/\s+/).indexOf(fileName) == -1) {
        extraTransforms.push(Compiler.curry(Compiler.logAndAssertWithLineNumberAndFileName, [moduleName])) 
      }
      extraTransforms.push(Compiler.curry(Compiler.addDebugInfo, [moduleName])) 
    }
    var buildIns = {  }
    var buildInNames = `self Self export$`.split(/\s+/)  
    var i = buildInNames.length; while(i--) {
      buildIns[buildInNames[i]] = 1
    }
    extraTransforms.push(Compiler.curry(Compiler.transformFreeSymbolsToLazyLoad, [buildIns]))
    -> Compiler.jsTransformers.concat(extraTransforms)
  }
  fix processModule
  fix processModuleSource = #(modulePath, source) {
    # do all transforms
    var transformedSource = trimEnd(Compiler.compile(source, getTransforms(getFileName(modulePath))))
    //log(transformedSource)
    # replace lazy dependencies load to direct refs (plus collect dependencies)
    var dependencies = []
    fix transformedSourceWithOutLazyLoad = transformedSource.replace(/load\(\"([a-zA-Z\d$]+?)\"\)/g, #(all, subModuleName) {
      dependencies.push(subModuleName)
      -> subModuleName
    })
    fix module = Module.new(){
      $.name = getFileName(modulePath)
      $.dependencies = dependencies
      $.source = transformedSourceWithOutLazyLoad
    }
    # process dependencies
    -> [module].concat([].concat.apply([], dependencies
      .map(#(subModuleName) {
        //log(subModuleName)
        fix subModulePath = Loader.lookupModule(getParentFolder(topModulePath), subModuleName)
        assert(subModulePath != null, tml(`can not find ${ subModuleName } (required by ${ modulePath })`))
        -> processModule(subModulePath)
      }))
    ) 
  }
  processModule = memo(#(modulePath) {
    //log(`processing ` + modulePath)
    fix source = Loader.loadFile(modulePath)
    assert(source != null)
    -> processModuleSource(modulePath, source)
  })
  ? replace to better variant
  var unique = #(vs) {
    -> vs.filter(#(v, k) {
      -> vs.slice(k + 1).indexOf(v) == -1
    }) 
  }
  fix topModuleSource = trimEnd(Loader.loadFile(topModulePath)) + eol + eol + tml(`
    self(commandLineArgs, cwd)
  `)
  fix graph = (unique(processModuleSource(topModulePath, topModuleSource))
    # loosy unique
    .map(#(module) {
      module.dependencies = unique($f)
      -> module
    })
    # usual sort do not work in our case
    /*
    .sort(#(a, b) {
      if(a.dependencies.indexOf(b.name) == -1) {
        -> 1  
      }
      else {
        -> 0
      }
    })
    */
  )
  var out = []
  for(i: graph.length >> 1) {
    var independentK = 0
    loop {
      assert(independentK < graph.length)
      if(graph[independentK].dependencies.some(#(dependency) {
        -> graph.!some(#(module) {
          module.name == dependency
        })
      })) {
        break
      }
      independentK = $f + 1
    }
    out.push(graph[independentK])
    graph.splice(independentK, 1)
  }
  out.push(graph[0])
  graph = out.reverse()
  ? log(Json.stringify(graph))
  -> (graph
    .map(#(module) {
      -> eval(tml(`
        var ${ module.name } = (function(export$) { arguments.callee.parentFn = null
          with(export$) {
        ${ indent(module.source, 4) }
            return export$.self
          }
        })({ __proto__: null })
      `))
    })
    .join(eol + eol)
  )
} 

? still issue w/ node and mixinRuntime in standalone js
export #(args) {
  var i = 1
  loop {
    if(i == args.length) {
      break
    }
    var arg = args[i]
    if(arg == `--keep-spec`) {
      isKeepSpec = yes
    }
    else if(arg == `--add-debug-info`) {
      isAddDebugInfo = yes
    } 
    else if(arg == `--help`) {
      log(help)
    } 
    else {
      if(arg.match(/^--/) != null) {
        log(tml(`Unknown option ${ arg }`))
        break
      }
      else {
        break
      }
    }
    i = $f + 1
  }
  
  if(i < args.length && args[i].match(/^--/) == null) {
    var modulePath = nativePathToUnixPath(args[i])
    if(isRelativePath(modulePath)) {
      modulePath = cwd + modulePath
    }
    var outputPath 
    if(args[i + 1]) {
      outputPath = nativePathToUnixPath(args[i + 1])
      if(isRelativePath(outputPath)) {
        outputPath = cwd + outputPath
      }
    }
    else {
      outputPath = getParentFolder(modulePath) + getFileName(modulePath) + `.build.js`
    }
    
    var mixinRuntimeSource = ``
    if(nativeGlobal.Proxy && {  }.__proto__) {
      mixinRuntimeSource = trimEnd(Loader.loadFile(Loader.vendorDir + `../../mixinRuntime.js`))
      mixinRuntimeSource = tml(`
        this.regMixinEnv = (function(exports) {
        ${ mixinRuntimeSource }
        return exports  
        }).call(this, {  }).regMixinEnv
        this.regMixinEnv(this)
      `)
    }
    
    fix es5ShimPath = Loader.vendorDir + `../../es5Shim.js`
    fix modulePath
    var requireFix = ``
    if(nativeGlobal.require) {
      requireFix = `;(1, eval)("this").require = require`
    }
    fix out = eval(tml(`
      ${ requireFix }
      ${ trimEnd(Loader.loadFile(es5ShimPath)) }  
      ;(function() {
        
      ${ mixinRuntimeSource }
      ${ build(modulePath) }
      }).call((1, eval)("this"))
    `))
    saveTextFile(outputPath, out)
  }
  else {
    log(`Missed modulePath`)
  }
}