const localStorageKeys = {
  grammarConsole: "grammarConsole",
  codeConsole: "codeConsole",
  grammarPath: "grammarPath"
}

const reset = () => Object.values(localStorageKeys).forEach(val => localStorage.removeItem(val))

const loadScripts = async (grammarCode, grammarPath) => {
  if (!grammarCode || !grammarPath) return undefined
  jtree.NonTerminalNode.setAsBackupConstructor(true)
  try {
    const grammarProgram = jtree.GrammarProgram.newFromCondensed(grammarCode, "")
    const loadedScripts = await grammarProgram.loadAllConstructorScripts(jtree.Utils.getPathWithoutFileName(grammarPath) + "/")
    console.log(`Loaded scripts ${loadedScripts.join(", ")}...`)
    $("#otherErrors").html("")
  } catch (err) {
    console.error(err)
    $("#otherErrors").html(err)
  }
}

const main = async grammarSourceCode => {
  const grammarConsole = $("#grammarConsole")
  const codeConsole = $("#codeConsole")
  const codeErrorsConsole = $("#codeErrorsConsole")
  const grammarErrorsConsole = $("#grammarErrorsConsole")

  const init = async () => {
    const gram = localStorage.getItem(localStorageKeys.grammarConsole)
    console.log("Loading grammar...")
    if (gram) await loadScripts(gram, localStorage.getItem(localStorageKeys.grammarPath))

    const code = localStorage.getItem(localStorageKeys.codeConsole)
    console.log("Loading code...")
    if (localStorage.getItem(localStorageKeys.grammarConsole)) grammarConsole.val(gram)
    if (code) codeConsole.val(code)
    $("#version").html("Version: " + jtree.getVersion())
  }

  await init()

  const downloadBundle = () => {
    const grammarCode = grammarInstance.getValue()
    const grammarProgram = new jtree.GrammarProgram(grammarCode)
    const languageName = grammarProgram.get("grammar name")
    const extension = languageName

    const zip = new JSZip()

    const pack = {
      name: languageName,
      private: true,
      dependencies: {
        jtree: jtree.getVersion()
      }
    }

    const nodePath = `${languageName}.node.js`
    const samplePath = "sample." + extension
    const sampleCode = codeInstance.getValue()
    const browserPath = `${languageName}.browser.js`
    const rootProgramClassName = grammarProgram._getGeneratedClassName()
    zip.file("package.json", JSON.stringify(pack, null, 2))
    zip.file(
      "readme.md",
      `# ${languageName} Readme

### Installing

    npm install .

### Testing

    node test.js`
    )
    const testCode = `const program = new ${rootProgramClassName}(sampleCode)
const errors = program.getAllErrors()
console.log("Sample program compiled with " + errors.length + " errors.")
if (errors.length)
 console.log(errors.map(error => error.getMessage()))`

    zip.file(browserPath, grammarProgram.toBrowserJavascript())
    zip.file(nodePath, grammarProgram.toNodeJsJavascript())
    zip.file(`index.js`, `module.exports = require("./${nodePath}")`)
    zip.file(
      "index.html",
      `<script src="node_modules/jtree/built/jtree.browser.js"></script>
<script src="${browserPath}"></script>
<script>
const sampleCode = \`${sampleCode}\`
${testCode}
</script>`
    )
    zip.file(samplePath, sampleCode)
    zip.file(
      `test.js`,
      `const {${rootProgramClassName}} = require("./index.js")
/*keep-line*/ const sampleCode = require("fs").readFileSync("${samplePath}", "utf8")
${testCode}`
    )

    zip.generateAsync({ type: "blob" }).then(function(content) {
      // see FileSaver.js
      saveAs(content, languageName + ".zip")
    })
  }

  const GrammarConstructor = jtree.GrammarProgram.newFromCondensed(grammarSourceCode, "").getRootConstructor()
  const grammarInstance = new jtree.TreeNotationCodeMirrorMode("grammar", () => GrammarConstructor, undefined, CodeMirror)
    .register()
    .fromTextAreaWithAutocomplete(grammarConsole[0], { lineWrapping: true })

  const getGrammarErrors = grammarCode => new GrammarConstructor(grammarCode).getAllErrors()

  const grammarOnUpdate = () => {
    const grammarCode = grammarInstance.getValue()
    localStorage.setItem(localStorageKeys.grammarConsole, grammarCode)
    window.grammarProgram = new GrammarConstructor(grammarCode)
    const errs = window.grammarProgram.getAllErrors().map(err => err.toObject())
    grammarErrorsConsole.html(errs.length ? new TreeNode(errs).toFormattedTable(200) : "0 errors")
  }

  let grammarConstructor
  let cachedGrammarCode

  const getGrammarConstructor = () => {
    let currentGrammarCode = grammarInstance.getValue()

    // todo: for custom constructors, if they are not there, replace?

    if (!grammarConstructor || currentGrammarCode !== cachedGrammarCode) {
      try {
        const grammarProgram = jtree.GrammarProgram.newFromCondensed(currentGrammarCode, "")
        const grammarErrors = getGrammarErrors(currentGrammarCode)
        if (grammarErrors.length) {
          grammarConstructor = jtree.GrammarProgram.getTheAnyLanguageRootConstructor()
        } else grammarConstructor = grammarProgram.getRootConstructor()
        cachedGrammarCode = currentGrammarCode
        $("#otherErrors").html("")
      } catch (err) {
        console.error(err)
        $("#otherErrors").html(err)
      }
    }
    return grammarConstructor
  }

  const codeWidgets = []
  const codeOnUpdate = () => {
    const code = codeInstance.getValue()
    localStorage.setItem(localStorageKeys.codeConsole, code)
    const programConstructor = getGrammarConstructor()

    window.program = new programConstructor(code)
    const errs = window.program.getAllErrors()
    codeErrorsConsole.html(errs.length ? new TreeNode(errs.map(err => err.toObject())).toFormattedTable(200) : "0 errors")

    const cursor = codeInstance.getCursor()

    // todo: what if 2 errors?
    codeInstance.operation(function() {
      codeWidgets.forEach(widget => codeInstance.removeLineWidget(widget))
      codeWidgets.length = 0

      errs
        .filter(err => !err.isBlankLineError())
        .filter(err => !err.isCursorOnWord(cursor.line, cursor.ch))
        .slice(0, 1) // Only show 1 error at a time. Otherwise UX is not fun.
        .forEach(err => {
          const el = err.getCodeMirrorLineWidgetElement(() => {
            codeInstance.setValue(program.toString())
            codeOnUpdate()
          })
          codeWidgets.push(codeInstance.addLineWidget(err.getLineNumber() - 1, el, { coverGutter: false, noHScroll: false }))
        })
      const info = codeInstance.getScrollInfo()
      const after = codeInstance.charCoords({ line: cursor.line + 1, ch: 0 }, "local").top
      if (info.top + info.clientHeight < after) codeInstance.scrollTo(null, after - info.clientHeight + 3)
    })
  }

  grammarInstance.on("keyup", grammarOnUpdate)
  grammarInstance.on("keyup", () => {
    codeOnUpdate()
    // Hack to break CM cache:
    if (true) {
      const val = codeInstance.getValue()
      codeInstance.setValue("\n" + val)
      codeInstance.setValue(val)
    }
  })

  const codeInstance = new jtree.TreeNotationCodeMirrorMode("custom", getGrammarConstructor, undefined, CodeMirror)
    .register()
    .fromTextAreaWithAutocomplete(codeConsole[0], { lineWrapping: true })

  codeInstance.on("keyup", codeOnUpdate)

  //if (grammarInstance.getValue()) {
  grammarOnUpdate()
  codeOnUpdate()
  //}

  const fetchGrammar = async (grammarPath, samplePath) => {
    const grammar = await $.get(grammarPath)
    const sample = await $.get(samplePath)

    await loadScripts(grammar, grammarPath)
    localStorage.setItem(localStorageKeys.grammarPath, grammarPath)

    grammarInstance.setValue(grammar)
    grammarOnUpdate()
    codeInstance.setValue(sample)
    codeOnUpdate()
  }

  $("#samples").on("click", "a", function() {
    const el = $(this)
    const name = el.text().toLowerCase()

    const samplePath = el.attr("data-samplePath") || `/langs/${name}/sample.${name}`
    const grammarPath = el.attr("data-grammarPath") || `/langs/${name}/${name}.grammar`
    fetchGrammar(grammarPath, samplePath)
  })

  $("#downloadBundle").on("click", downloadBundle)
}

$(document).ready(function() {
  $("#resetButton").on("click", function() {
    reset()
    console.log("reset...")
    window.location.reload()
  })
  $("#execButton").on("click", function() {
    if (window.program) $("#execResults").val(window.program.executeSync())
    else $("#execResults").val("Program failed to execute")
  })
  $("#compileButton").on("click", function() {
    if (window.program) $("#execResults").val(window.program.compile())
    else $("#execResults").val("Program failed to compile")
  })
  $.get("/langs/grammar/grammar.grammar").then(main)
})
