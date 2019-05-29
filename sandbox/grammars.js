const localStorageKeys = {
  grammarConsole: "grammarConsole",
  codeConsole: "codeConsole",
  grammarPath: "grammarPath"
}

const reset = () => Object.values(localStorageKeys).forEach(val => localStorage.removeItem(val))

const loadScripts = async (grammarCode, grammarPath) => {
  if (!grammarCode || !grammarPath) return undefined
  const grammarProgram = jtree.GrammarProgram.newFromCondensed(grammarCode, "")
  const loadedScripts = await grammarProgram.loadAllConstructorScripts(jtree.Utils.getPathWithoutFileName(grammarPath) + "/")
  console.log(`Loaded scripts ${loadedScripts.join(", ")}...`)
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

  const GrammarConstructor = jtree.GrammarProgram.newFromCondensed(grammarSourceCode, "").getRootConstructor()
  const grammarInstance = new jtree.TreeNotationCodeMirrorMode("grammar", () => GrammarConstructor, undefined, CodeMirror)
    .register()
    .fromTextAreaWithAutocomplete(grammarConsole[0], { lineWrapping: true })

  const getGrammarErrors = grammarCode => new GrammarConstructor(grammarCode).getProgramErrors()

  const grammarOnUpdate = () => {
    const grammarCode = grammarInstance.getValue()
    localStorage.setItem(localStorageKeys.grammarConsole, grammarCode)
    window.grammarProgram = new GrammarConstructor(grammarCode)
    const errs = window.grammarProgram.getProgramErrors().map(err => err.toObject())
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
    const errs = window.program.getProgramErrors()
    codeErrorsConsole.html(errs.length ? new TreeNode(errs.map(err => err.toObject())).toFormattedTable(200) : "0 errors")

    // todo: what if 2 errors?
    codeInstance.operation(function() {
      codeWidgets.forEach(widget => codeInstance.removeLineWidget(widget))
      codeWidgets.length = 0

      errs
        .filter(err => !err.isBlankLineError())
        .forEach(err => {
          const el = document.createElement("div")
          const lineNumber = err.getLineNumber() - 1
          const suggestion = err.getSuggestionMessage()
          let msg
          if (suggestion) msg = `${err.getErrorTypeName()}. Suggestion: ${suggestion}`
          else msg = `${err.getMessage()}`
          el.appendChild(document.createTextNode(msg))
          el.className = "LintError" + (suggestion ? "WithSuggestion" : "")
          // todo: does this cause mem leak?
          if (suggestion)
            $(el).on("click", () => {
              err.applySuggestion()
              codeInstance.setValue(program.toString())
              codeOnUpdate()
            })
          codeWidgets.push(codeInstance.addLineWidget(lineNumber, el, { coverGutter: true, noHScroll: false }))
        })
      const info = codeInstance.getScrollInfo()
      const after = codeInstance.charCoords({ line: codeInstance.getCursor().line + 1, ch: 0 }, "local").top
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
