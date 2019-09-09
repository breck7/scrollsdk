//tooling onsave jtree build produce DesignerApp.browser.js
class DesignerApp {
  constructor(grammarSourceCode) {
    this.languages = "newlang hakon stump dumbdown dug iris fire swarm project stamp grammar config jibberish numbers poop".split(" ")
    this._codeErrorsConsole = jQuery("#codeErrorsConsole")
    this._codeConsole = jQuery("#codeConsole")
    this._grammarConsole = jQuery("#grammarConsole")
    this._grammarErrorsConsole = jQuery("#grammarErrorsConsole")
    this._execButton = jQuery("#execButton")
    this._readmeComponent = jQuery("#readmeComponent")
    this._execResultsTextArea = jQuery("#execResultsTextArea")
    this._compileButton = jQuery("#compileButton")
    this._explainButton = jQuery("#explainButton")
    this._explainRootsButton = jQuery("#explainRootsButton")
    this._downloadButton = jQuery("#downloadButton")
    this._samplesButtons = jQuery("#samplesButtons")
    this._resetButton = jQuery("#resetButton")
    this._otherErrorsDiv = jQuery("#otherErrorsDiv")
    this._versionSpan = jQuery("#versionSpan")
    this._shareLink = jQuery("#shareLink")
    this._inferKeywordGrammarButton = jQuery("#inferKeywordGrammarButton")
    this._simulateDataButton = jQuery("#simulateDataButton")
    this._localStorageKeys = {
      grammarConsole: "grammarConsole",
      codeConsole: "codeConsole"
    }
    this.codeWidgets = []
    this.GrammarConstructor = new jtree.GrammarProgram(grammarSourceCode).getRootConstructor()
  }
  async _loadFromDeepLink() {
    const hash = location.hash
    if (hash.length < 2) return false
    const deepLink = new jtree.TreeNode(decodeURIComponent(hash.substr(1)))
    const standard = deepLink.get("standard")
    if (standard) {
      console.log("Loading standard from deep link....")
      await this._fetchJTreeStandardGrammar(standard)
      return true
    } else {
      const grammarCode = deepLink.getNode("grammar")
      const sampleCode = deepLink.getNode("sample")
      if (grammarCode && sampleCode) {
        console.log("Loading custom from deep link....")
        this._setGrammarAndCode(grammarCode.childrenToString(), sampleCode.childrenToString())
        return true
      }
    }
    return false
  }
  _clearHash() {
    history.replaceState(null, null, " ")
  }
  _onGrammarKeyup() {
    this._grammarDidUpdate()
    this._onCodeKeyUp()
    // Hack to break CM cache:
    if (true) {
      const val = this.codeInstance.getValue()
      this.codeInstance.setValue("\n" + val)
      this.codeInstance.setValue(val)
    }
  }
  async start() {
    this._samplesButtons.html(`Example Languages: ` + this.languages.map(lang => `<a href="#standard%20${lang}">${jtree.Utils.ucfirst(lang)}</a>`).join(" | "))
    this._bindListeners()
    this._versionSpan.html("Version: " + jtree.getVersion())
    this.grammarInstance = new jtree.TreeNotationCodeMirrorMode("grammar", () => this.GrammarConstructor, undefined, CodeMirror)
      .register()
      .fromTextAreaWithAutocomplete(this._grammarConsole[0], { lineWrapping: true })
    this.grammarInstance.on("keyup", () => {
      this._onGrammarKeyup()
    })
    this.codeInstance = new jtree.TreeNotationCodeMirrorMode("custom", () => this._getGrammarConstructor(), undefined, CodeMirror)
      .register()
      .fromTextAreaWithAutocomplete(this._codeConsole[0], { lineWrapping: true })
    this.codeInstance.on("keyup", () => this._onCodeKeyUp())
    // loadFromURL
    const wasLoadedFromDeepLink = await this._loadFromDeepLink()
    if (!wasLoadedFromDeepLink) await this._restoreFromLocalStorage()
  }
  resetCommand() {
    Object.values(this._localStorageKeys).forEach(val => localStorage.removeItem(val))
  }
  _setProgramResults(results) {
    this._execResultsTextArea.val(results)
    const el = this._execResultsTextArea[0]
    el.style.height = el.scrollHeight + "px"
  }
  _clearResults() {
    this._execResultsTextArea.val("")
  }
  _bindListeners() {
    const that = this
    this._execButton.on("click", () => {
      this._setProgramResults(this.program ? this.program.executeSync() : "Program failed to execute")
    })
    this._compileButton.on("click", () => {
      this._setProgramResults(this.program ? this.program.compile() : "Program failed to execute")
    })
    this._explainRootsButton.on("click", () => {
      this._setProgramResults(this.program ? this.program.getInPlacePreludeCellTypeTreeWithNodeConstructorNames() : "Program failed to parse")
    })
    this._explainButton.on("click", () => {
      this._setProgramResults(this.program ? this.program.getInPlaceCellTypeTreeWithNodeConstructorNames() : "Program failed to parse")
    })
    this._resetButton.on("click", () => {
      this.resetCommand()
      console.log("reset...")
      window.location.reload()
    })
    this._samplesButtons.on("click", "a", function() {
      that._fetchJTreeStandardGrammar(
        jQuery(this)
          .text()
          .toLowerCase()
      )
    })
    this._inferKeywordGrammarButton.on("click", () => {
      this.grammarInstance.setValue(new jtree.UnknownGrammarProgram(this.codeInstance.getValue()).inferGrammarFileForAKeywordLanguage("inferredLanguage"))
      this._onGrammarKeyup()
    })
    this._simulateDataButton.on("click", () => {
      const grammarProgram = new jtree.GrammarProgram(this.grammarInstance.getValue())
      this.codeInstance.setValue(
        grammarProgram
          ._getRootNodeTypeDefinitionNode()
          .generateSimulatedData()
          .join("\n")
      )
      this._onCodeKeyUp()
    })
    this._downloadButton.on("click", () => this._downloadBundleCommand())
  }
  // TODO: ADD TESTS!!!!!
  async _downloadBundleCommand() {
    const grammarProgram = new jtree.GrammarProgram(this.grammarInstance.getValue())
    const zip = new JSZip()
    const bundle = grammarProgram.toBundle()
    Object.keys(bundle).forEach(key => {
      zip.file(key, bundle[key])
    })
    const languageName = grammarProgram.getExtensionName()
    zip.generateAsync({ type: "blob" }).then(content => {
      // see FileSaver.js
      saveAs(content, languageName + ".zip")
    })
  }
  async _restoreFromLocalStorage() {
    console.log("Restoring from local storage....")
    const grammarCode = localStorage.getItem(this._localStorageKeys.grammarConsole)
    const code = localStorage.getItem(this._localStorageKeys.codeConsole)
    if (typeof grammarCode === "string" && typeof code === "string") this._setGrammarAndCode(grammarCode, code)
    return grammarCode || code
  }
  _updateLocalStorage() {
    localStorage.setItem(this._localStorageKeys.grammarConsole, this.grammarInstance.getValue())
    localStorage.setItem(this._localStorageKeys.codeConsole, this.codeInstance.getValue())
    this._updateShareLink() // todo: where to put this?
    console.log("Local storage updated...")
  }
  _getGrammarErrors(grammarCode) {
    return new this.GrammarConstructor(grammarCode).getAllErrors()
  }
  _getGrammarConstructor() {
    let currentGrammarCode = this.grammarInstance.getValue()
    if (!this._grammarConstructor || currentGrammarCode !== this._cachedGrammarCode) {
      try {
        const grammarErrors = this._getGrammarErrors(currentGrammarCode)
        this._grammarConstructor = new jtree.GrammarProgram(currentGrammarCode).getRootConstructor()
        this._cachedGrammarCode = currentGrammarCode
        this._otherErrorsDiv.html("")
      } catch (err) {
        console.error(err)
        this._otherErrorsDiv.html(err)
      }
    }
    return this._grammarConstructor
  }
  _grammarDidUpdate() {
    const grammarCode = this.grammarInstance.getValue()
    this._updateLocalStorage()
    this.grammarProgram = new this.GrammarConstructor(grammarCode)
    const errs = this.grammarProgram.getAllErrors().map(err => err.toObject())
    this._grammarErrorsConsole.html(errs.length ? new jtree.TreeNode(errs).toFormattedTable(200) : "0 errors")
    const grammarProgram = new jtree.GrammarProgram(this.grammarInstance.getValue())
    const readme = new dumbdownNode(grammarProgram.toReadMe()).compile()
    this._readmeComponent.html(readme)
  }
  _updateShareLink() {
    const url = new URL(location.href)
    url.hash = ""
    const base = url.toString()
    this._shareLink.val(base + this.toShareLink())
  }
  toShareLink() {
    const tree = new jtree.TreeNode()
    tree.appendLineAndChildren("grammar", this.grammarInstance.getValue())
    tree.appendLineAndChildren("sample", this.codeInstance.getValue())
    return "#" + encodeURIComponent(tree.toString())
  }
  _onCodeKeyUp() {
    const code = this.codeInstance.getValue()
    this._updateLocalStorage()
    const programConstructor = this._getGrammarConstructor()
    this.program = new programConstructor(code)
    const errs = this.program.getAllErrors()
    this._codeErrorsConsole.html(errs.length ? new jtree.TreeNode(errs.map(err => err.toObject())).toFormattedTable(200) : "0 errors")
    const cursor = this.codeInstance.getCursor()
    // todo: what if 2 errors?
    this.codeInstance.operation(() => {
      this.codeWidgets.forEach(widget => this.codeInstance.removeLineWidget(widget))
      this.codeWidgets.length = 0
      errs
        .filter(err => !err.isBlankLineError())
        .filter(err => !err.isCursorOnWord(cursor.line, cursor.ch))
        .slice(0, 1) // Only show 1 error at a time. Otherwise UX is not fun.
        .forEach(err => {
          const el = err.getCodeMirrorLineWidgetElement(() => {
            this.codeInstance.setValue(this.program.toString())
            this._onCodeKeyUp()
          })
          this.codeWidgets.push(this.codeInstance.addLineWidget(err.getLineNumber() - 1, el, { coverGutter: false, noHScroll: false }))
        })
      const info = this.codeInstance.getScrollInfo()
      const after = this.codeInstance.charCoords({ line: cursor.line + 1, ch: 0 }, "local").top
      if (info.top + info.clientHeight < after) this.codeInstance.scrollTo(null, after - info.clientHeight + 3)
    })
  }
  _setGrammarAndCode(grammar, code) {
    this.grammarInstance.setValue(grammar)
    this.codeInstance.setValue(code)
    this._clearHash()
    this._grammarDidUpdate()
    this._onCodeKeyUp()
    this._clearResults()
  }
  async _fetchJTreeStandardGrammar(name) {
    const samplePath = `/langs/${name}/sample.${name}`
    const grammarPath = `/langs/${name}/${name}.grammar`
    const grammar = await jQuery.get(grammarPath)
    const sample = await jQuery.get(samplePath)
    this._setGrammarAndCode(grammar, sample)
  }
}
jQuery(document).ready(function() {
  jQuery.get("/langs/grammar/grammar.grammar").then(grammarSourceCode => {
    const app = new DesignerApp(grammarSourceCode)
    window.app = app
    app.start()
  })
})
window.DesignerApp = DesignerApp
