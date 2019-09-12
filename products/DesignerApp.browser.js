//onsave jtree build produce DesignerApp.browser.js
class DesignerCommander extends AbstractCommander {
  constructor(app) {
    super(app)
    this._app = app
  }
}
class DesignerApp extends AbstractTreeComponentRootNode {
  constructor() {
    super(...arguments)
    this.languages = "newlang hakon stump dumbdown dug iris fire swarm project stamp grammar config jibberish numbers poop".split(" ")
    this._localStorageKeys = {
      grammarConsole: "grammarConsole",
      codeConsole: "codeConsole"
    }
    this.codeWidgets = []
    this._commander = new DesignerCommander(this)
  }
  createParser() {
    return new jtree.TreeNode.Parser(undefined, {
      githubTriangleComponent: githubTriangleComponent,
      samplesComponent: samplesComponent,
      tableComponent: tableComponent,
      shareComponent: shareComponent,
      headerComponent: headerComponent
    })
  }
  get _codeErrorsConsole() {
    return jQuery("#codeErrorsConsole")
  }
  get _codeConsole() {
    return jQuery("#codeConsole")
  }
  get _grammarConsole() {
    return jQuery("#grammarConsole")
  }
  get _grammarErrorsConsole() {
    return jQuery("#grammarErrorsConsole")
  }
  get _execButton() {
    return jQuery("#execButton")
  }
  get _readmeComponent() {
    return jQuery("#readmeComponent")
  }
  get _execResultsTextArea() {
    return jQuery("#execResultsTextArea")
  }
  get _htmlOutputDiv() {
    return jQuery("#htmlOutputDiv")
  }
  get _compileButton() {
    return jQuery("#compileButton")
  }
  get _visualizeButton() {
    return jQuery("#visualizeButton")
  }
  get _downloadButton() {
    return jQuery("#downloadButton")
  }
  get _samplesButtons() {
    return jQuery("#samplesButtons")
  }
  get _resetButton() {
    return jQuery("#resetButton")
  }
  get _otherErrorsDiv() {
    return jQuery("#otherErrorsDiv")
  }
  get _versionSpan() {
    return jQuery("#versionSpan")
  }
  get _shareLink() {
    return jQuery("#shareLink")
  }
  get _inferKeywordGrammarButton() {
    return jQuery("#inferKeywordGrammarButton")
  }
  get _simulateDataButton() {
    return jQuery("#simulateDataButton")
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
  async appWillFirstRender() {
    const willowBrowser = this.getWillowProgram()
    const result = await willowBrowser.httpGetUrl("/langs/grammar/grammar.grammar")
    this.GrammarConstructor = new jtree.GrammarProgram(result.text).getRootConstructor()
  }
  resetCommand() {
    Object.values(this._localStorageKeys).forEach(val => localStorage.removeItem(val))
  }
  _setProgramResults(results, htmlResults = "") {
    this._execResultsTextArea.val(results)
    if (results) {
      const el = this._execResultsTextArea[0] // todo: remove
      el.style.height = el.scrollHeight + "px"
    }
    this._htmlOutputDiv.html(htmlResults)
  }
  _clearResults() {
    this._execResultsTextArea.val("")
  }
  _visualizeIt(program) {
    const columns = this.program.getProgramWidth()
    const cellTypes = new jtree.TreeNode(this.program.getInPlaceCellTypeTreeWithNodeConstructorNames())
    const rootCellTypes = new jtree.TreeNode(this.program.getInPlacePreludeCellTypeTreeWithNodeConstructorNames())
    const table = this.program
      .getProgramAsCells()
      .map((line, lineIndex) => {
        let rows = ""
        for (let cellIndex = 0; cellIndex < columns; cellIndex++) {
          const cell = line[cellIndex]
          if (!cell) rows += `<td>&nbsp;</td>`
          else {
            const cellType = cellTypes.nodeAt(lineIndex).getWord(cellIndex + 1)
            const rootCellType = rootCellTypes.nodeAt(lineIndex).getWord(cellIndex + 1)
            const nodeType = cellTypes.nodeAt(lineIndex).getWord(0)
            rows += `<td title="cellType:${cellType} rootCellType:${rootCellType} nodeType:${nodeType}">${cell.getWord()}</td>`
          }
        }
        return `<tr>${rows}</tr>`
      })
      .join("\n")
    return `<table class="iceCubes">${table}</table>`
  }
  _bindListeners() {
    const that = this
    this._execButton.on("click", () => {
      this._setProgramResults(this.program ? this.program.executeSync() : "Program failed to execute")
    })
    this._compileButton.on("click", () => {
      this._setProgramResults(this.program ? this.program.compile() : "Program failed to execute")
    })
    this._visualizeButton.on("click", () => {
      if (!this.program) return this._setProgramResults("Program failed to parse")
      this._setProgramResults("", this._visualizeIt(this.program))
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
    const button = jQuery("input[name=onCodeUp]:checked")
    if (button.length) button.next().click()
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
  treeComponentDidMount() {
    this._setBodyShadowHandlers()
  }
  getCommander() {
    return this._commander
  }
  async _setBodyShadowHandlers() {
    // todo: refactor!!! splut these into components
    this._bindListeners()
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
  getHakon() {
    const theme = this.getTheme()
    return `body
 font-family "San Francisco", "Myriad Set Pro", "Lucida Grande", "Helvetica Neue", Helvetica, Arial, Verdana, sans-serif
 margin auto
 max-width 1200px
 background #eee
 color rgba(1, 47, 52, 1)
 h1
  font-weight 300
.CodeMirror-gutters
 background transparent
.CodeMirror
 background transparent
input,textarea
 background transparent
table
 width 100%
 table-layout fixed
td
 vertical-align top
 width 50%
 border 1px solid gray
.iceCubes
 tr,td
  margin 0
  box-shadow rgba(1,1,1,.4) 1px 1px 1px
  overflow scroll
#otherErrorsDiv
 color red
code
 white-space pre
pre
 overflow scroll
a
 cursor pointer
 color rgba(1, 47, 52, 1)
 text-decoration underline
#shareDiv
 font-size 16px
 width 100%
 span
  width 50px
  display inline-block
 input
  font-size 16px
  padding 5px
  width calc(100% - 70px)
#execResultsTextArea
  border 0
  width 100%
.LintError,.LintErrorWithSuggestion,.LintCellTypeHints
 white-space pre
 color red
 background #e5e5e5
.LintCellTypeHints
 color black
.LintErrorWithSuggestion
 cursor pointer`
  }
  static getDefaultStartState() {
    return `headerComponent
samplesComponent
shareComponent
tableComponent
githubTriangleComponent`
  }
}
class samplesComponent extends AbstractTreeComponent {
  constructor() {
    super(...arguments)
    this.languages = "newlang hakon stump dumbdown dug iris fire swarm project stamp grammar config jibberish numbers poop".split(" ")
  }
  getStumpCode() {
    const langs = this.languages.map(lang => `<a href="#standard%20${lang}">${jtree.Utils.ucfirst(lang)}</a>`).join(" | ")
    return `p Example Languages: ${langs}
 id samplesButtons`
  }
}
class shareComponent extends AbstractTreeComponent {
  getStumpCode() {
    return `div
 id shareDiv
 span Share
 input
  id shareLink
  readonly`
  }
}
class otherErrorsComponent extends AbstractTreeComponent {
  getStumpCode() {
    return `div
 id otherErrorsDiv`
  }
}
class tableComponent extends AbstractTreeComponent {
  getStumpCode() {
    return `table
 tr
  td
   span Grammar for your Tree Language
   a Infer Prefix Grammar
    id inferKeywordGrammarButton
   span  | 
   a Download Bundle
    id downloadButton
   span  | 
   a Generate Random Program
    id simulateDataButton
   br
   textarea
    id grammarConsole
  td
   span Source Code in your Language
   input
    name onCodeUp
    type radio
   a Execute
    id execButton
   span  | 
   input
    type radio
    name onCodeUp
   a Compile
    id compileButton
   span  | 
   input
    type radio
    name onCodeUp
   a Explain
    id visualizeButton
   br
   textarea
    id codeConsole
 tr
  td
   div Grammar Errors
   pre
    id grammarErrorsConsole
   div
    id readmeComponent
  td
   div Language Errors
   pre
    id codeErrorsConsole
   div Output:
   textarea
    id execResultsTextArea
    placeholder Results...
   div
    id htmlOutputDiv`
  }
}
class headerComponent extends AbstractTreeComponent {
  _getTitle() {
    return `Tree Notation Sandbox`
  }
  getHakon() {
    return `#logo
 width 100px
 vertical-align middle`
  }
  getStumpCode() {
    return `div
 h1
  a
   href https://treenotation.org
   style text-decoration: none;
   img
    id logo
    src /helloWorld3D.svg
    title TreeNotation.org
  span ${this._getTitle()}
 p
  a Tree Language Sandbox
   href /sandbox/
  span  | 
  a Help
   id helpToggleButton
   onclick $('#helpSection').toggle(); return false;
  span  | 
  a Watch the Tutorial Video
   href https://www.youtube.com/watch?v=UQHaI78jGR0=
  span  | 
  a Reset
   id resetButton
  span  | Version ${jtree.getVersion()}
 div
  id helpSection
  style display: none;
  p This is a simple web IDE for designing and building Tree Languages. To build a Tree Language, you write code in a "grammar language" in the textarea on the left. You can then write code in your new language in the textarea on the right. You instantly get syntax highlighting, autocomplete, type/cell checking, suggested corrections, and more.
  p Click "Newlang" to create a New Language, or explore/edit existing languages. In dev tools, you can access the parsed trees below as "app.grammarProgram" and program at "app.program". We also have a work-in-progress <a href="https://github.com/breck7/jtree/blob/master/languageChecklist.md">checklist for creating new Tree Languages</a>.`
  }
}
class githubTriangleComponent extends AbstractTreeComponent {
  _getGitHubLink() {
    return `https://github.com/treenotation/jtree/tree/master/designer`
  }
  getHakon() {
    return `.githubTriangleComponent
 display block
 position absolute
 top 0
 right 0`
  }
  getStumpCode() {
    return `a
 class githubTriangleComponent
 href ${this._getGitHubLink()}
 img
  src /github-fork.svg`
  }
}
window.DesignerApp = DesignerApp
