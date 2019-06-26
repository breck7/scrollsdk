//onsave /usr/local/bin/tsc -p /Users/breck/jtree/sandbox/build/

// todo: get typings in here.
declare var jtree: any
declare var CodeMirror: any
declare var saveAs: any
declare var JSZip: any

class GrammarIDEApp {
  constructor(grammarSourceCode: string) {
    this.GrammarConstructor = jtree.GrammarProgram.newFromCondensed(grammarSourceCode, "").getRootConstructor()
  }

  private async _loadFromDeepLink() {
    const hash = location.hash
    if (hash.length < 2) return ""

    await this._fetchJTreeStandardGrammar(hash.substr(1))
  }

  public languages = "hakon swarm project stamp grammar stump jibberish fire numbers".split(" ")

  async start() {
    this._samplesButtons.html(`Example Languages: ` + this.languages.map(lang => `<a href="#${lang}">${jtree.Utils.ucfirst(lang)}</a>`).join(" | "))

    this._bindListeners()

    this._versionSpan.html("Version: " + jtree.getVersion())

    const wasRestoredFromLocalStorage = await this._restoreFromLocalStorage()

    this.grammarInstance = new jtree.TreeNotationCodeMirrorMode("grammar", () => this.GrammarConstructor, undefined, CodeMirror)
      .register()
      .fromTextAreaWithAutocomplete(<any>this._grammarConsole[0], { lineWrapping: true })

    this.grammarInstance.on("keyup", () => this._grammarDidUpdate())
    this.grammarInstance.on("keyup", () => {
      this._codeDidUpdate()
      // Hack to break CM cache:
      if (true) {
        const val = this.codeInstance.getValue()
        this.codeInstance.setValue("\n" + val)
        this.codeInstance.setValue(val)
      }
    })

    this.codeInstance = new jtree.TreeNotationCodeMirrorMode("custom", () => this._getGrammarConstructor(), undefined, CodeMirror)
      .register()
      .fromTextAreaWithAutocomplete(<any>this._codeConsole[0], { lineWrapping: true })

    this.codeInstance.on("keyup", () => this._codeDidUpdate())

    this._grammarDidUpdate()
    this._codeDidUpdate()

    // loadFromURL
    if (!wasRestoredFromLocalStorage) await this._loadFromDeepLink()
  }

  resetCommand() {
    Object.values(this._localStorageKeys).forEach(val => localStorage.removeItem(val))
  }

  public program: any
  public grammarProgram: any

  private _codeErrorsConsole = jQuery("#codeErrorsConsole")
  private _codeConsole = jQuery("#codeConsole")
  private _grammarConsole = jQuery("#grammarConsole")
  private _grammarErrorsConsole = jQuery("#grammarErrorsConsole")
  private _resetButton = jQuery("#resetButton")
  private _execButton = jQuery("#execButton")
  private _execResultsTextArea = jQuery("#execResultsTextArea")
  private _compileButton = jQuery("#compileButton")
  private _downloadButton = jQuery("#downloadButton")
  private _samplesButtons = jQuery("#samplesButtons")
  private _otherErrorsDiv = jQuery("#otherErrorsDiv")
  private _versionSpan = jQuery("#versionSpan")

  private _bindListeners() {
    this._resetButton.on("click", () => {
      this.resetCommand()
      console.log("reset...")
      window.location.reload()
    })
    this._execButton.on("click", () => {
      if (this.program) this._execResultsTextArea.val(this.program.executeSync())
      else this._execResultsTextArea.val("Program failed to execute")
    })
    this._compileButton.on("click", () => {
      if (this.program) this._execResultsTextArea.val(this.program.compile())
      else this._execResultsTextArea.val("Program failed to compile")
    })
    const that = this
    this._samplesButtons.on("click", "a", function() {
      that._fetchJTreeStandardGrammar(
        jQuery(this)
          .text()
          .toLowerCase()
      )
    })

    this._downloadButton.on("click", () => this._downloadBundleCommand())
  }

  private _localStorageKeys = {
    grammarConsole: "grammarConsole",
    codeConsole: "codeConsole",
    grammarPath: "grammarPath"
  }

  private GrammarConstructor: any
  private grammarInstance: any
  private codeInstance: any

  private async _loadScripts(grammarCode: string, grammarPath: string) {
    if (!grammarCode || !grammarPath) return undefined
    jtree.NonTerminalNode.setAsBackupConstructor(true) // todo: remove?
    try {
      const grammarProgram = jtree.GrammarProgram.newFromCondensed(grammarCode, "")
      const loadedScripts = await grammarProgram.loadAllConstructorScripts(jtree.Utils.getPathWithoutFileName(grammarPath) + "/")
      console.log(`Loaded scripts ${loadedScripts.join(", ")}...`)
      this._otherErrorsDiv.html("")
    } catch (err) {
      console.error(err)
      this._otherErrorsDiv.html(err)
    }
  }

  private async _downloadBundleCommand() {
    const grammarCode = this.grammarInstance.getValue()
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
    const sampleCode = this.codeInstance.getValue()
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

  private async _restoreFromLocalStorage() {
    const grammarCode = localStorage.getItem(this._localStorageKeys.grammarConsole)
    if (grammarCode) await this._loadScripts(grammarCode, localStorage.getItem(this._localStorageKeys.grammarPath))

    const code = localStorage.getItem(this._localStorageKeys.codeConsole)
    if (localStorage.getItem(this._localStorageKeys.grammarConsole)) this._grammarConsole.val(grammarCode)
    if (code) this._codeConsole.val(code)
    return grammarCode || code
  }

  private _grammarConstructor: any
  private _cachedGrammarCode: string

  private _getGrammarErrors(grammarCode) {
    return new this.GrammarConstructor(grammarCode).getAllErrors()
  }

  private _getGrammarConstructor() {
    let currentGrammarCode = this.grammarInstance.getValue()

    // todo: for custom constructors, if they are not there, replace?

    if (!this._grammarConstructor || currentGrammarCode !== this._cachedGrammarCode) {
      try {
        const grammarProgram = jtree.GrammarProgram.newFromCondensed(currentGrammarCode, "")
        const grammarErrors = this._getGrammarErrors(currentGrammarCode)
        if (grammarErrors.length) {
          this._grammarConstructor = jtree.GrammarProgram.getTheAnyLanguageRootConstructor()
        } else this._grammarConstructor = grammarProgram.getRootConstructor()
        this._cachedGrammarCode = currentGrammarCode
        this._otherErrorsDiv.html("")
      } catch (err) {
        console.error(err)
        this._otherErrorsDiv.html(err)
      }
    }
    return this._grammarConstructor
  }

  private _grammarDidUpdate() {
    const grammarCode = this.grammarInstance.getValue()
    localStorage.setItem(this._localStorageKeys.grammarConsole, grammarCode)
    this.grammarProgram = new this.GrammarConstructor(grammarCode)
    const errs = this.grammarProgram.getAllErrors().map(err => err.toObject())
    this._grammarErrorsConsole.html(errs.length ? new jtree.TreeNode(errs).toFormattedTable(200) : "0 errors")
  }

  private codeWidgets: any[] = []

  private _codeDidUpdate() {
    const code = this.codeInstance.getValue()
    localStorage.setItem(this._localStorageKeys.codeConsole, code)
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
            this._codeDidUpdate()
          })
          this.codeWidgets.push(this.codeInstance.addLineWidget(err.getLineNumber() - 1, el, { coverGutter: false, noHScroll: false }))
        })
      const info = this.codeInstance.getScrollInfo()
      const after = this.codeInstance.charCoords({ line: cursor.line + 1, ch: 0 }, "local").top
      if (info.top + info.clientHeight < after) this.codeInstance.scrollTo(null, after - info.clientHeight + 3)
    })
  }

  private async _fetchJTreeStandardGrammar(name) {
    const samplePath = `/langs/${name}/sample.${name}`
    const grammarPath = `/langs/${name}/${name}.grammar`
    const grammar = await jQuery.get(grammarPath)
    const sample = await jQuery.get(samplePath)

    await this._loadScripts(grammar, grammarPath)
    localStorage.setItem(this._localStorageKeys.grammarPath, grammarPath)

    this.grammarInstance.setValue(grammar)
    this._grammarDidUpdate()
    this.codeInstance.setValue(sample)
    this._codeDidUpdate()
  }
}

jQuery(document).ready(function() {
  jQuery.get("/langs/grammar/grammar.grammar").then(grammarSourceCode => {
    const app = new GrammarIDEApp(grammarSourceCode)
    ;(<any>window).app = app
    app.start()
  })
})
