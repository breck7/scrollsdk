const main = grammarSourceCode => {
  const grammarConsole = $("#grammarConsole")
  const codeConsole = $("#codeConsole")

  // Init vars
  if (localStorage.getItem("grammarConsole")) grammarConsole.val(localStorage.getItem("grammarConsole"))
  if (localStorage.getItem("codeConsole")) codeConsole.val(localStorage.getItem("codeConsole"))

  const GrammarConstructor = jtree.GrammarProgram.newFromCondensed(grammarSourceCode, "").getRootConstructor()
  const grammarInstance = new jtree.TreeNotationCodeMirrorMode(
    "grammar",
    () => GrammarConstructor,
    undefined,
    CodeMirror
  )
    .register()
    .fromTextAreaWithAutocomplete(grammarConsole[0], { lineWrapping: true })

  grammarInstance.on("keyup", () => {
    const grammarCode = grammarInstance.getValue()
    localStorage.setItem("grammarConsole", grammarCode)
    window.grammarProgram = new GrammarConstructor(grammarCode)
  })

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

  codeInstance.on("keyup", () => {
    const code = codeInstance.getValue()
    localStorage.setItem("codeConsole", code)
    window.program = new grammarConstructor(code)
  })
}

$(document).ready(function() {
  $.get("/grammar.grammar").then(main)
})
