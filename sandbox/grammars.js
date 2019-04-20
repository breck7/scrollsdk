const main = grammarSourceCode => {
  const grammarConsole = $("#grammarConsole")
  const codeConsole = $("#codeConsole")
  const codeErrorsConsole = $("#codeErrorsConsole")
  const grammarErrorsConsole = $("#grammarErrorsConsole")

  // Init vars
  if (localStorage.getItem("grammarConsole")) grammarConsole.val(localStorage.getItem("grammarConsole"))
  if (localStorage.getItem("codeConsole")) codeConsole.val(localStorage.getItem("codeConsole"))
  $("#version").html("Version: " + jtree.getVersion())

  const GrammarConstructor = jtree.GrammarProgram.newFromCondensed(grammarSourceCode, "").getRootConstructor()
  const grammarInstance = new jtree.TreeNotationCodeMirrorMode(
    "grammar",
    () => GrammarConstructor,
    undefined,
    CodeMirror
  )
    .register()
    .fromTextAreaWithAutocomplete(grammarConsole[0], { lineWrapping: true })

  const updateGrammar = () => {
    const grammarCode = grammarInstance.getValue()
    localStorage.setItem("grammarConsole", grammarCode)
    window.grammarProgram = new GrammarConstructor(grammarCode)
    const errs = window.grammarProgram.getProgramErrors()
    grammarErrorsConsole.html(errs.length ? new TreeNode(errs).toTable() : "0 errors")
  }
  grammarInstance.on("keyup", updateGrammar)

  let grammarConstructor
  let cachedGrammarCode

  const codeInstance = new jtree.TreeNotationCodeMirrorMode(
    "custom",
    () => {
      const currentGrammarCode = grammarInstance.getValue()
      if (!grammarConstructor || currentGrammarCode !== cachedGrammarCode) {
        cachedGrammarCode = currentGrammarCode
        const grammarPath = ""

        try {
          const grammarProgram = jtree.GrammarProgram.newFromCondensed(currentGrammarCode, grammarPath)
          grammarConstructor = grammarProgram.getRootConstructor()
        } catch (err) {
          debugger
        }
      }
      return grammarConstructor
    },
    undefined,
    CodeMirror
  )
    .register()
    .fromTextAreaWithAutocomplete(codeConsole[0], { lineWrapping: true })

  const updateCode = () => {
    const code = codeInstance.getValue()
    localStorage.setItem("codeConsole", code)
    window.program = new grammarConstructor(code)
    const errs = window.program.getProgramErrors()
    codeErrorsConsole.html(new TreeNode(errs).toTable())
  }

  codeInstance.on("keyup", updateCode)

  updateCode()
  updateGrammar()
}

$(document).ready(function() {
  $.get("/grammar.grammar").then(main)
})
