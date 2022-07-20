//onsave jtree build produce DesignerApp.browser.js
class DesignerApp extends AbstractTreeComponent {
  constructor() {
    super(...arguments)
    ///
    this.languages = "newlang hakon stump dumbdown arrow dug iris fire chuck wwt swarm project stamp grammar config jibberish numbers poop".split(" ")
    this._localStorageKeys = {
      grammarConsole: "grammarConsole",
      codeConsole: "codeConsole"
    }
    this.codeWidgets = []
  }
  createParser() {
    return new jtree.TreeNode.Parser(undefined, {
      githubTriangleComponent,
      samplesComponent,
      tableComponent,
      shareComponent,
      headerComponent,
      otherErrorsComponent,
      TreeComponentFrameworkDebuggerComponent
    })
  }
  _clearResults() {
    this.willowBrowser.setHtmlOfElementsWithClassHack("resultsDiv")
    this.willowBrowser.setValueOfElementsWithClassHack("resultsDiv")
  }
  ///
  async executeCommand() {
    const result = await this.program.execute()
    this.willowBrowser.setValueOfElementWithIdHack("executeResultsDiv", Array.isArray(result) ? result.join(",") : result)
  }
  compileCommand() {
    this.willowBrowser.setValueOfElementWithIdHack("compileResultsDiv", this.program.compile())
  }
  showAutoCompleteCubeCommand() {
    this.willowBrowser.setHtmlOfElementWithIdHack("explainResultsDiv", this.program.toAutoCompleteCube().toHtmlCube())
  }
  visualizeCommand() {
    this.willowBrowser.setHtmlOfElementWithIdHack("explainResultsDiv", this._toIceTray(this.program))
  }
  inferPrefixGrammarCommand() {
    this.setGrammarCode(new jtree.UnknownGrammarProgram(this.getCodeValue()).inferGrammarFileForAKeywordLanguage("inferredLanguage"))
    this._onGrammarKeyup()
  }
  synthesizeProgramCommand() {
    const grammarProgram = new jtree.HandGrammarProgram(this.getGrammarCode())
    this.setCodeCode(
      grammarProgram
        .getRootNodeTypeDefinitionNode()
        .synthesizeNode()
        .join("\n")
    )
    this._onCodeKeyUp()
  }
  resetCommand() {
    Object.values(this._localStorageKeys).forEach(val => localStorage.removeItem(val))
    const willowBrowser = this.willowBrowser
    willowBrowser.reload()
  }
  async fetchAndLoadJtreeShippedLanguageCommand(name) {
    const samplePath = `/langs/${name}/sample.${name}`
    const grammarPath = `/langs/${name}/${name}.grammar`
    const willowBrowser = this.willowBrowser
    const grammar = await willowBrowser.httpGetUrl(grammarPath)
    const sample = await willowBrowser.httpGetUrl(samplePath)
    this._setGrammarAndCode(grammar.text, sample.text)
  }
  async fetchAndLoadGrammarFromUrlCommand(url) {
    const willowBrowser = this.willowBrowser
    const grammar = await willowBrowser.httpGetUrl(url)
    const grammarProgram = new jtree.HandGrammarProgram(grammar.text)
    const rootNodeDef = grammarProgram.getRootNodeTypeDefinitionNode()
    const sample = rootNodeDef.getNode("example").childrenToString()
    this._setGrammarAndCode(grammar.text, sample)
  }
  // TODO: ADD TESTS!!!!!
  async downloadBundleCommand() {
    const grammarProgram = new jtree.HandGrammarProgram(this.getGrammarCode())
    const bundle = grammarProgram.toBundle()
    const languageName = grammarProgram.getExtensionName()
    return this._makeZipBundle(languageName + ".zip", bundle)
  }
  async _makeZipBundle(fileName, bundle) {
    const zip = new JSZip()
    Object.keys(bundle).forEach(key => {
      zip.file(key, bundle[key])
    })
    zip.generateAsync({ type: "blob" }).then(content => {
      // see FileSaver.js
      saveAs(content, fileName)
    })
  }
  _toIceTray(program) {
    const columns = program.getProgramWidth()
    const cellTypes = new jtree.TreeNode(program.toCellTypeTreeWithNodeConstructorNames())
    const rootCellTypes = new jtree.TreeNode(program.toPreludeCellTypeTreeWithNodeConstructorNames())
    const table = program
      .getProgramAsCells()
      .map((line, lineIndex) => {
        const nodeType = cellTypes.nodeAt(lineIndex).getWord(0)
        let cells = `<td class="iceTrayNodeType">${nodeType}</td>` // todo: add ancestry
        for (let cellIndex = 0; cellIndex < columns; cellIndex++) {
          const cell = line[cellIndex]
          if (!cell) cells += `<td>&nbsp;</td>`
          else {
            const cellType = cellTypes.nodeAt(lineIndex).getWord(cellIndex + 1)
            const rootCellType = rootCellTypes.nodeAt(lineIndex).getWord(cellIndex + 1)
            const cellTypeDivs = [cellType, rootCellType] // todo: add full ancestry
            cells += `<td><span class="cellTypeSpan">${cellTypeDivs.join(" ")}</span>${cell.getWord()}</td>`
          }
        }
        return `<tr>${cells}</tr>`
      })
      .join("\n")
    return `<table class="iceCubes">${table}</table>`
  }
  async _loadFromDeepLink() {
    const hash = location.hash
    if (hash.length < 2) return false
    const deepLink = new jtree.TreeNode(decodeURIComponent(hash.substr(1)))
    const standard = deepLink.get("standard")
    const fromUrl = deepLink.get("url")
    if (standard) {
      console.log("Loading standard from deep link....")
      await this.fetchAndLoadJtreeShippedLanguageCommand(standard)
      return true
    } else if (fromUrl) {
      console.log(`Loading grammar from '${fromUrl}'....`)
      await this.fetchAndLoadGrammarFromUrlCommand(fromUrl)
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
      const val = this.getCodeValue()
      this.setCodeCode("\n" + val)
      this.setCodeCode(val)
    }
  }
  async start() {
    this._bindTreeComponentFrameworkCommandListenersOnBody()
    this.renderAndGetRenderReport(this.willowBrowser.getBodyStumpNode())
    this.grammarInstance = new jtree.TreeNotationCodeMirrorMode("grammar", () => grammarNode, undefined, CodeMirror).register().fromTextAreaWithAutocomplete(document.getElementById("grammarConsole"), { lineWrapping: true })
    this.grammarInstance.on("keyup", () => {
      this._onGrammarKeyup()
    })
    this.codeInstance = new jtree.TreeNotationCodeMirrorMode("custom", () => this._getGrammarConstructor(), undefined, CodeMirror).register().fromTextAreaWithAutocomplete(document.getElementById("codeConsole"), { lineWrapping: true })
    this.codeInstance.on("keyup", () => this._onCodeKeyUp())
    // loadFromURL
    const wasLoadedFromDeepLink = await this._loadFromDeepLink()
    if (!wasLoadedFromDeepLink) await this._restoreFromLocalStorage()
  }
  getGrammarCode() {
    return this.grammarInstance.getValue()
  }
  setGrammarCode(code) {
    this.grammarInstance.setValue(code)
  }
  setCodeCode(code) {
    this.codeInstance.setValue(code)
  }
  getCodeValue() {
    return this.codeInstance.getValue()
  }
  async _restoreFromLocalStorage() {
    console.log("Restoring from local storage....")
    const grammarCode = localStorage.getItem(this._localStorageKeys.grammarConsole)
    const code = localStorage.getItem(this._localStorageKeys.codeConsole)
    if (typeof grammarCode === "string" && typeof code === "string") this._setGrammarAndCode(grammarCode, code)
    return grammarCode || code
  }
  _updateLocalStorage() {
    localStorage.setItem(this._localStorageKeys.grammarConsole, this.getGrammarCode())
    localStorage.setItem(this._localStorageKeys.codeConsole, this.getCodeValue())
    this._updateShareLink() // todo: where to put this?
    console.log("Local storage updated...")
  }
  _getGrammarErrors(grammarCode) {
    return new grammarNode(grammarCode).getAllErrors()
  }
  _getGrammarConstructor() {
    let currentGrammarCode = this.getGrammarCode()
    if (!this._grammarConstructor || currentGrammarCode !== this._cachedGrammarCode) {
      try {
        const grammarErrors = this._getGrammarErrors(currentGrammarCode)
        this._grammarConstructor = new jtree.HandGrammarProgram(currentGrammarCode).compileAndReturnRootConstructor()
        this._cachedGrammarCode = currentGrammarCode
        this.willowBrowser.setHtmlOfElementWithIdHack("otherErrorsDiv")
      } catch (err) {
        console.error(err)
        this.willowBrowser.setHtmlOfElementWithIdHack("otherErrorsDiv", err)
      }
    }
    return this._grammarConstructor
  }
  onCommandError(err) {
    console.log(err)
    this.willowBrowser.setHtmlOfElementWithIdHack("otherErrorsDiv", err)
  }
  _grammarDidUpdate() {
    const grammarCode = this.getGrammarCode()
    this._updateLocalStorage()
    this.grammarProgram = new grammarNode(grammarCode)
    const errs = this.grammarProgram.getAllErrors().map(err => err.toObject())
    this.willowBrowser.setHtmlOfElementWithIdHack("grammarErrorsConsole", errs.length ? new jtree.TreeNode(errs).toFormattedTable(200) : "0 errors")
    const grammarProgram = new jtree.HandGrammarProgram(this.grammarInstance.getValue())
    const readme = new dumbdownNode(grammarProgram.toReadMe()).compile()
    this.willowBrowser.setHtmlOfElementWithIdHack("readmeComponent", readme)
  }
  _updateShareLink() {
    const url = new URL(location.href)
    url.hash = ""
    const base = url.toString()
    this.willowBrowser.setValueOfElementWithIdHack("shareLink", base + this.toShareLink())
  }
  toShareLink() {
    const tree = new jtree.TreeNode()
    tree.appendLineAndChildren("grammar", this.getGrammarCode())
    tree.appendLineAndChildren("sample", this.getCodeValue())
    return "#" + encodeURIComponent(tree.toString())
  }
  _onCodeKeyUp() {
    const { willowBrowser } = this
    const code = this.getCodeValue()
    this._updateLocalStorage()
    const programConstructor = this._getGrammarConstructor()
    const that = this
    this.program = new programConstructor(code)
    const errs = this.program.scopeErrors.concat(this.program.getAllErrors())
    willowBrowser.setHtmlOfElementWithIdHack("codeErrorsConsole", errs.length ? new jtree.TreeNode(errs.map(err => err.toObject())).toFormattedTable(200) : "0 errors")
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
    if (willowBrowser.getElementById("visualizeCommand").checked) this.visualizeCommand()
    if (willowBrowser.getElementById("compileCommand").checked) this.compileCommand()
    if (willowBrowser.getElementById("executeCommand").checked) this.executeCommand()
  }
  _setGrammarAndCode(grammar, code) {
    this.setGrammarCode(grammar)
    this.setCodeCode(code)
    this._clearHash()
    this._grammarDidUpdate()
    this._clearResults()
    this._onCodeKeyUp()
  }
  toHakonCode() {
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
 background transparent !important
.CodeMirror
 background transparent !important
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
  overflow scroll
  border 0
 td
  box-shadow rgba(1,1,1,.1) 1px 1px 1px
  position relative
  padding 10px 3px 2px 2px
  .cellTypeSpan
   position absolute
   white-space nowrap
   left 0
   top 0
   font-size 8px
   color rgba(1,1,1,.2)
 .iceTrayNodeType
  box-shadow none
  font-size 8px
  color rgba(1,1,1,.2)
 tr
  &:hover
   td
    .iceTrayNodeType
     color rgba(1,1,1,.5)
    .cellTypeSpan
     color rgba(1,1,1,.5)
code
 white-space pre
pre
 overflow scroll
.htmlCubeSpan
 --topIncrement 1px
 --leftIncrement 1px
 --cellWidth 100px
 --rowHeight 30px
 position absolute
 box-sizing border-box
 width var(--cellWidth)
 height var(--rowHeight)
 overflow hidden
 text-overflow hidden
 display inline-block
 text-align center
 line-height var(--rowHeight)
 font-size 12px
 font-family -apple-system, BlinkMacSystemFont, sans-serif
 color rgba(0, 0, 0, 0.8)
 background rgba(255, 255, 255, 1)
 border 1px solid rgba(0, 0, 0, 0.3)
 &:hover
  opacity 1
  background rgba(255, 255, 255, 1)
  z-index 2
a
 cursor pointer
 color rgba(1, 47, 52, 1)
 text-decoration underline
.LintError,.LintErrorWithSuggestion,.LintCellTypeHints
 white-space pre
 color red
 background #e5e5e5
.LintCellTypeHints
 color black
.LintErrorWithSuggestion
 cursor pointer`
  }
}
class samplesComponent extends AbstractTreeComponent {
  toStumpCode() {
    const langs = this.getRootNode()
      .languages.map(
        lang => ` a ${jtree.Utils.ucfirst(lang)}
  href #standard%20${lang}
  value ${lang}
  clickCommand fetchAndLoadJtreeShippedLanguageCommand`
      )
      .join("\n span  | \n")
    return `p
 span Example Languages 
${langs}`
  }
}
class shareComponent extends AbstractTreeComponent {
  toStumpCode() {
    return `div
 id shareDiv
 span Share
 input
  id shareLink
  readonly`
  }
  toHakonCode() {
    return `#shareDiv
 font-size 16px
 width 100%
 span
  width 50px
  display inline-block
 input
  font-size 16px
  padding 5px
  width calc(100% - 70px)`
  }
}
class otherErrorsComponent extends AbstractTreeComponent {
  toStumpCode() {
    return `div
 id otherErrorsDiv`
  }
  toHakonCode() {
    return `#otherErrorsDiv
 color red`
  }
}
// Todo: use these 3
class compiledResultsComponent extends AbstractTreeComponent {}
class executionResultsComponent extends AbstractTreeComponent {
  toHakonCode() {
    return `#execResultsTextArea
 border 0
 width 100%`
  }
  toStumpCode() {
    return `textarea
 id execResultsTextArea
 placeholder Results...`
  }
}
class explainResultsComponent extends AbstractTreeComponent {
  toStumpCode() {
    return `div`
  }
}
class tableComponent extends AbstractTreeComponent {
  createParser() {
    return new jtree.TreeNode.Parser(undefined, {
      compiledResultsComponent: compiledResultsComponent,
      executionResultsComponent: executionResultsComponent,
      explainResultsComponent: explainResultsComponent
    })
  }
  toHakonCode() {
    return `textarea.resultsDiv
 height 120px
 width 220px`
  }
  toStumpCode() {
    return `table
 tr
  td
   span Grammar for your Tree Language 
   a Infer Prefix Grammar
    clickCommand inferPrefixGrammarCommand
   span  |
   a Download Bundle
    clickCommand downloadBundleCommand
   span  |
   a Synthesize Program
    clickCommand synthesizeProgramCommand
   textarea
    id grammarConsole
  td
   span Source Code in your Language
   input
    type checkbox
    id executeCommand
   a Execute
    clickCommand executeCommand
   span  |
   input
    type checkbox
    id compileCommand
   a Compile
    clickCommand compileCommand
   span  |
   input
    type checkbox
    id visualizeCommand
   a Explain
    clickCommand visualizeCommand
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
   textarea
    class resultsDiv
    id executeResultsDiv
    placeholder Execution results
   textarea
    class resultsDiv
    id compileResultsDiv
    placeholder Compilation results
   div
    class resultsDiv
    style position:relative;
    id explainResultsDiv`
  }
}
class headerComponent extends AbstractTreeComponent {
  _getTitle() {
    return `Tree Language Designer`
  }
  toHakonCode() {
    return `#logo
 width 100px
 vertical-align middle`
  }
  toggleHelpCommand() {
    const element = document.getElementById("helpSection")
    element.style.display = element.style.display == "none" ? "block" : "none"
  }
  toStumpCode() {
    return `div
 h1
  a
   href https://treenotation.org
   style text-decoration: none;
   img
    id logo
    src /images/helloWorld3D.svg
    title TreeNotation.org
  span ${this._getTitle()}
 p
  a Tree Notation Sandbox
   href /sandbox/
  span  | 
  a Help
   id helpToggleButton
   clickCommand toggleHelpCommand
  span  | 
  a Watch the Tutorial Video
   href https://www.youtube.com/watch?v=kf2p8yzThAA
  span  | 
  a Reset
   clickCommand resetCommand
  span  | 
  a Debug
   clickCommand toggleTreeComponentFrameworkDebuggerCommand
  span  | Version ${jtree.getVersion()}
 div
  id helpSection
  style display: none;
  p This is a simple web IDE for designing and building Tree Languages. To build a Tree Language, you write code in a "grammar language" in the textarea on the left. You can then write code in your new language in the textarea on the right. You instantly get syntax highlighting, autocomplete, type/cell checking, suggested corrections, and more.
  p Click "Newlang" to create a New Language, or explore/edit existing languages. In dev tools, you can access the parsed trees below as "app.grammarProgram" and program at "app.program". We also have a work-in-progress <a href="https://jtree.treenotation.org/languageChecklist.html">checklist for creating new Tree Languages</a>.`
  }
}
class githubTriangleComponent extends AbstractGithubTriangleComponent {
  constructor() {
    super(...arguments)
    this.githubLink = `https://github.com/treenotation/jtree/tree/main/designer`
  }
}
window.DesignerApp = DesignerApp
