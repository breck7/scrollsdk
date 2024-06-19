class DesignerApp extends AbstractTreeComponentParser {
  constructor() {
    super(...arguments)
    ///
    this.languages = "newlang parsers hakon stump dumbdown arrow dug iris fire chuck fruit swarm project stamp config jibberish numbers poop".split(" ")
    this._localStorageKeys = {
      parsersConsole: "parsersConsole",
      codeConsole: "codeConsole"
    }
    this.codeWidgets = []
  }
  createParserCombinator() {
    return new TreeNode.ParserCombinator(undefined, {
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
    this.willowBrowser.setHtmlOfElementWithIdHack("explainResultsDiv", this.program.toAutoCompleteCube().asHtmlCube)
  }
  visualizeCommand() {
    this.willowBrowser.setHtmlOfElementWithIdHack("explainResultsDiv", this._toIceTray(this.program))
  }
  inferPrefixParsersCommand() {
    this.setParsersCode(new UnknownParsersProgram(this.getCodeValue()).inferParsersFileForAKeywordLanguage("inferredLanguage"))
    this._onParsersKeyup()
  }
  synthesizeProgramCommand() {
    const parsersProgram = new HandParsersProgram(this.getParsersCode())
    this.setCodeCode(parsersProgram.rootParserDefinition.synthesizeNode().join("\n"))
    this._onCodeKeyUp()
  }
  resetCommand() {
    Object.values(this._localStorageKeys).forEach(val => localStorage.removeItem(val))
    const willowBrowser = this.willowBrowser
    willowBrowser.reload()
  }
  async fetchAndLoadScrollSDKShippedLanguageCommand(name) {
    const samplePath = `/langs/${name}/sample.${name}`
    const parsersPath = `/langs/${name}/${name}.parsers`
    const willowBrowser = this.willowBrowser
    const parsers = await willowBrowser.httpGetUrl(parsersPath)
    const sample = await willowBrowser.httpGetUrl(samplePath)
    this._setParsersAndCode(parsers.text, sample.text)
  }
  async fetchAndLoadParsersFromUrlCommand(url, programUrl) {
    const willowBrowser = this.willowBrowser
    const parsers = await willowBrowser.httpGetUrl(url)
    const parsersProgram = new HandParsersProgram(parsers.text)
    const rootNodeDef = parsersProgram.rootParserDefinition
    let sample = rootNodeDef.getNode("example").childrenToString()
    if (programUrl) {
      sample = await willowBrowser.httpGetUrl(programUrl)
      sample = sample.text
    }
    this._setParsersAndCode(parsers.text, sample)
  }
  // TODO: ADD TESTS!!!!!
  async downloadBundleCommand() {
    const parsersProgram = new HandParsersProgram(this.getParsersCode())
    const bundle = parsersProgram.toBundle()
    const languageName = parsersProgram.extensionName
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
    const columns = program.programWidth
    const cellTypes = new TreeNode(program.asCellTypeTreeWithParserIds)
    const rootCellTypes = new TreeNode(program.toPreludeCellTypeTreeWithParserIds())
    const table = program.programAsCells
      .map((line, lineIndex) => {
        const parser = cellTypes.nodeAt(lineIndex).getWord(0)
        let cells = `<td class="iceTrayParser">${parser}</td>` // todo: add ancestry
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
    const deepLink = new TreeNode(decodeURIComponent(hash.substr(1)))
    const standard = deepLink.get("standard")
    const fromUrl = deepLink.get("url")
    const programUrl = deepLink.get("programUrl")
    if (standard) {
      console.log("Loading standard from deep link....")
      await this.fetchAndLoadScrollSDKShippedLanguageCommand(standard)
      return true
    } else if (fromUrl) {
      console.log(`Loading parsers from '${fromUrl}'....`)
      await this.fetchAndLoadParsersFromUrlCommand(fromUrl, programUrl)
      return true
    } else {
      const parsersCode = deepLink.getNode("parsers")
      const sampleCode = deepLink.getNode("sample")
      if (parsersCode && sampleCode) {
        console.log("Loading custom from deep link....")
        this._setParsersAndCode(parsersCode.childrenToString(), sampleCode.childrenToString())
        return true
      }
    }
    return false
  }
  _clearHash() {
    history.replaceState(null, null, " ")
  }
  _onParsersKeyup() {
    this._updateLocalStorage()
    this._parsersDidUpdate()
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
    this.parsersInstance = new ParsersCodeMirrorMode("parsers", () => parsersParser, undefined, CodeMirror).register().fromTextAreaWithAutocomplete(document.getElementById("parsersConsole"), { lineWrapping: true })
    this.parsersInstance.on("keyup", () => {
      this._onParsersKeyup()
    })
    this.codeInstance = new ParsersCodeMirrorMode("custom", () => this._getParsersParser(), undefined, CodeMirror).register().fromTextAreaWithAutocomplete(document.getElementById("codeConsole"), { lineWrapping: true })
    this.codeInstance.on("keyup", () => this._onCodeKeyUp())
    // loadFromURL
    const wasLoadedFromDeepLink = await this._loadFromDeepLink()
    if (!wasLoadedFromDeepLink) await this._restoreFromLocalStorage()
  }
  getParsersCode() {
    return this.parsersInstance.getValue()
  }
  setParsersCode(code) {
    this.parsersInstance.setValue(code)
  }
  setCodeCode(code) {
    this.codeInstance.setValue(code)
  }
  getCodeValue() {
    return this.codeInstance.getValue()
  }
  async _restoreFromLocalStorage() {
    console.log("Restoring from local storage....")
    const parsersCode = localStorage.getItem(this._localStorageKeys.parsersConsole)
    const code = localStorage.getItem(this._localStorageKeys.codeConsole)
    if (typeof parsersCode === "string" && typeof code === "string") this._setParsersAndCode(parsersCode, code)
    return parsersCode || code
  }
  _updateLocalStorage() {
    localStorage.setItem(this._localStorageKeys.parsersConsole, this.getParsersCode())
    localStorage.setItem(this._localStorageKeys.codeConsole, this.getCodeValue())
    this._updateShareLink() // todo: where to put this?
    console.log("Local storage updated...")
  }
  _getParsersErrors(parsersCode) {
    return new parsersParser(parsersCode).getAllErrors()
  }
  _getParsersParser() {
    let currentParsersCode = this.getParsersCode()
    if (!this._parsersParser || currentParsersCode !== this._cachedParsersCode) {
      try {
        const parsersErrors = this._getParsersErrors(currentParsersCode)
        this._parsersParser = new HandParsersProgram(currentParsersCode).compileAndReturnRootParser()
        this._cachedParsersCode = currentParsersCode
        this.willowBrowser.setHtmlOfElementWithIdHack("otherErrorsDiv")
      } catch (err) {
        console.error(err)
        this.willowBrowser.setHtmlOfElementWithIdHack("otherErrorsDiv", err)
      }
    }
    return this._parsersParser
  }
  onCommandError(err) {
    console.log(err)
    this.willowBrowser.setHtmlOfElementWithIdHack("otherErrorsDiv", err)
  }
  _parsersDidUpdate() {
    const parsersCode = this.getParsersCode()
    this.parsersProgram = new parsersParser(parsersCode)
    const errs = this.parsersProgram.getAllErrors().map(err => err.toObject())
    this.willowBrowser.setHtmlOfElementWithIdHack("parsersErrorsConsole", errs.length ? new TreeNode(errs).toFormattedTable(200) : "0 errors")
    const parsersProgram = new HandParsersProgram(this.parsersInstance.getValue())
    const readme = new dumbdownParser(parsersProgram.toReadMe()).compile()
    this.willowBrowser.setHtmlOfElementWithIdHack("readmeComponent", readme)
  }
  _updateShareLink() {
    const url = new URL(location.href)
    url.hash = ""
    const base = url.toString()
    this.willowBrowser.setValueOfElementWithIdHack("shareLink", base + this.toShareLink())
  }
  toShareLink() {
    const tree = new TreeNode()
    tree.appendLineAndChildren("parsers", this.getParsersCode())
    tree.appendLineAndChildren("sample", this.getCodeValue())
    return "#" + encodeURIComponent(tree.asString)
  }
  _onCodeKeyUp() {
    const { willowBrowser } = this
    const code = this.getCodeValue()
    this._updateLocalStorage()
    const parsersParser = this._getParsersParser()
    const that = this
    this.program = new parsersParser(code)
    const errs = this.program.scopeErrors.concat(this.program.getAllErrors())
    willowBrowser.setHtmlOfElementWithIdHack("codeErrorsConsole", errs.length ? new TreeNode(errs.map(err => err.toObject())).toFormattedTable(200) : "0 errors")
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
            this.codeInstance.setValue(this.program.asString)
            this._onCodeKeyUp()
          })
          this.codeWidgets.push(this.codeInstance.addLineWidget(err.lineNumber - 1, el, { coverGutter: false, noHScroll: false }))
        })
      const info = this.codeInstance.getScrollInfo()
      const after = this.codeInstance.charCoords({ line: cursor.line + 1, ch: 0 }, "local").top
      if (info.top + info.clientHeight < after) this.codeInstance.scrollTo(null, after - info.clientHeight + 3)
    })
    if (willowBrowser.getElementById("visualizeCommand").checked) this.visualizeCommand()
    if (willowBrowser.getElementById("compileCommand").checked) this.compileCommand()
    if (willowBrowser.getElementById("executeCommand").checked) this.executeCommand()
  }
  _setParsersAndCode(parsers, code) {
    this.setParsersCode(parsers)
    this.setCodeCode(code)
    this._clearHash()
    this._parsersDidUpdate()
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
 .iceTrayParser
  box-shadow none
  font-size 8px
  color rgba(1,1,1,.2)
 tr
  &:hover
   td
    .iceTrayParser
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
class samplesComponent extends AbstractTreeComponentParser {
  toStumpCode() {
    const langs = this.root.languages
      .map(
        lang => ` a ${Utils.ucfirst(lang)}
  href #standard%20${lang}
  value ${lang}
  clickCommand fetchAndLoadScrollSDKShippedLanguageCommand`
      )
      .join("\n span  | \n")
    return `p
 span Examples 
${langs}`
  }
}
class shareComponent extends AbstractTreeComponentParser {
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
class otherErrorsComponent extends AbstractTreeComponentParser {
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
class compiledResultsComponent extends AbstractTreeComponentParser {}
class executionResultsComponent extends AbstractTreeComponentParser {
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
class explainResultsComponent extends AbstractTreeComponentParser {
  toStumpCode() {
    return `div`
  }
}
class tableComponent extends AbstractTreeComponentParser {
  createParserCombinator() {
    return new TreeNode.ParserCombinator(undefined, {
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
   span Your Parsers &nbsp;
   a Infer Prefix Parsers
    clickCommand inferPrefixParsersCommand
   span  | &nbsp;
   a Synthesize Program
    clickCommand synthesizeProgramCommand
   textarea
    id parsersConsole
  td
   span Your Program
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
   div Parser Errors
   pre
    id parsersErrorsConsole
   div
    id readmeComponent
  td
   div Program Errors
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
class headerComponent extends AbstractTreeComponentParser {
  _getTitle() {
    return `Parser Designer`
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
   href https://notation.scroll.pub
   style text-decoration: none;
   img
    id logo
    src /images/helloWorld3D.svg
    title Notation.Scroll.pub
  span ${this._getTitle()}
 p
  a Scroll Notation Sandbox
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
  span  | Version ${TreeNode.getVersion()}
 div
  id helpSection
  style display: none;
  p This is a simple web IDE for designing and building languages on top of Scroll Notation. To build a language, you write Parsers in the textarea on the left. You can then write code in your new language in the textarea on the right. You instantly get syntax highlighting, autocomplete, type/cell checking, suggested corrections, and more.
  p Click "Newlang" to create a New Language, or explore/edit existing languages. In dev tools, you can access the parsed trees below as "app.parsersProgram" and program at "app.program". We also have a work-in-progress <a href="https://sdk.scroll.pub/parsersTutorial.html">Tutorial for creating new languages using Parsers</a>.`
  }
}
class githubTriangleComponent extends AbstractGithubTriangleComponent {
  constructor() {
    super(...arguments)
    this.githubLink = `https://github.com/breck7/scrollsdk/tree/main/designer`
  }
}
window.DesignerApp = DesignerApp
