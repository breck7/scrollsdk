const localStorageKeys = {
  grammarConsole: "grammarConsole",
  codeConsole: "codeConsole"
}

const reset = () => Object.values(localStorageKeys).forEach(val => localStorage.removeItem(val))

const main = grammarSourceCode => {
  const grammarConsole = $("#grammarConsole")
  const codeConsole = $("#codeConsole")
  const codeErrorsConsole = $("#codeErrorsConsole")
  const grammarErrorsConsole = $("#grammarErrorsConsole")

  const init = () => {
    const gram = localStorage.getItem(localStorageKeys.grammarConsole)
    console.log("Loading grammar...")
    const code = localStorage.getItem(localStorageKeys.codeConsole)
    console.log("Loading code...")
    if (localStorage.getItem(localStorageKeys.grammarConsole)) grammarConsole.val(gram)
    if (code) codeConsole.val(code)
    $("#version").html("Version: " + jtree.getVersion())
  }

  init()

  const GrammarConstructor = jtree.GrammarProgram.newFromCondensed(grammarSourceCode, "").getRootConstructor()
  const grammarInstance = new jtree.TreeNotationCodeMirrorMode(
    "grammar",
    () => GrammarConstructor,
    undefined,
    CodeMirror
  )
    .register()
    .fromTextAreaWithAutocomplete(grammarConsole[0], { lineWrapping: true })

  const getGrammarErrors = grammarCode => new GrammarConstructor(grammarCode).getProgramErrors()

  const grammarOnUpdate = () => {
    const grammarCode = grammarInstance.getValue()
    localStorage.setItem(localStorageKeys.grammarConsole, grammarCode)
    window.grammarProgram = new GrammarConstructor(grammarCode)
    const errs = window.grammarProgram.getProgramErrors()
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
      } catch (err) {
        console.error(err)
        $("#otherErrors").html(err)
        debugger
      }
    }
    return grammarConstructor
  }

  const codeOnUpdate = () => {
    const code = codeInstance.getValue()
    localStorage.setItem(localStorageKeys.codeConsole, code)
    const programConstructor = getGrammarConstructor()

    window.program = new programConstructor(code)
    const errs = window.program.getProgramErrors()
    codeErrorsConsole.html(errs.length ? new TreeNode(errs).toFormattedTable(200) : "0 errors")
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

  const fetchGrammar = (grammarPath, samplePath) => {
    $.get(grammarPath).then(grammar => {
      $.get(samplePath).then(sample => {
        grammarInstance.setValue(grammar)
        grammarOnUpdate()
        codeInstance.setValue(sample)
        codeOnUpdate()
      })
    })
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
  })
  $("#execButton").on("click", function() {
    if (window.program) $("#execResults").html("Result: " + window.program.executeSync())
    else $("#execResults").html("Program failed to execute")
  })
  $.get("/langs/grammar/grammar.grammar").then(main)
})
