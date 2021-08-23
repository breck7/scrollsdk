//onsave jtree build produce DesignerApp.browser.js

const { AbstractTreeComponent, TreeComponentFrameworkDebuggerComponent } = require("../products/TreeComponentFramework.node.js")
const { jtree } = require("../index.js")

const { GithubTriangleComponent } = require("./components/GitHubTriangle.ts")
const { SamplesComponent } = require("./components/Samples.ts")
const { CodeSheetComponent } = require("./components/CodeSheet.ts")
const { ShareComponent } = require("./components/Share.ts")
const { HeaderComponent } = require("./components/Header.ts")
const { ErrorDisplayComponent } = require("./components/ErrorDisplay.ts")
const { GrammarWorkspaceComponent } = require("./components/GrammarWorkspace.ts")
const { CodeWorkspaceComponent } = require("./components/CodeWorkspace.ts")

declare var grammarNode: any

// todo: get typings in here.
declare var CodeMirror: any
declare var dumbdownNode: any

class DesignerApp extends AbstractTreeComponent {
  createParser() {
    return new jtree.TreeNode.Parser(undefined, {
      TreeComponentFrameworkDebuggerComponent,
      GithubTriangleComponent,
      SamplesComponent,
      CodeSheetComponent,
      ShareComponent,
      HeaderComponent,
      ErrorDisplayComponent,
      GrammarWorkspaceComponent,
      CodeWorkspaceComponent
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

  resetCommand() {
    Object.values(this._localStorageKeys).forEach(val => localStorage.removeItem(val))
    const willowBrowser = this.willowBrowser
    willowBrowser.reload()
  }

  async fetchAndLoadJtreeShippedLanguageCommand(name: string) {
    const samplePath = `/langs/${name}/sample.${name}`
    const grammarPath = `/langs/${name}/${name}.grammar`

    const willowBrowser = this.willowBrowser
    const grammar = await willowBrowser.httpGetUrl(grammarPath)
    const sample = await willowBrowser.httpGetUrl(samplePath)

    this._setGrammarAndCode(grammar.text, sample.text)
  }

  async fetchAndLoadGrammarFromUrlCommand(url: string) {
    const willowBrowser = this.willowBrowser
    const grammar = await willowBrowser.httpGetUrl(url)
    const grammarProgram = new jtree.HandGrammarProgram(grammar.text)
    const rootNodeDef = grammarProgram.getRootNodeTypeDefinitionNode()
    const sample = rootNodeDef.getNode("example").childrenToString()

    this._setGrammarAndCode(grammar.text, sample)
  }

  private _toIceTray(program: any) {
    const columns = program.getProgramWidth()

    const cellTypes = new jtree.TreeNode(program.toCellTypeTreeWithNodeConstructorNames())
    const rootCellTypes = new jtree.TreeNode(program.toPreludeCellTypeTreeWithNodeConstructorNames())

    const table = program
      .getProgramAsCells()
      .map((line: any, lineIndex: number) => {
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

  public program: any
  public grammarProgram: any

  _localStorageKeys = {
    grammarConsole: "grammarConsole",
    codeConsole: "codeConsole"
  }

  private grammarInstance: any
  private codeInstance: any

  private _grammarConstructor: any
  private _cachedGrammarCode: string

  private codeWidgets: any[] = []

  private async _loadFromDeepLink() {
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

  private _clearHash() {
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

    this.codeSheet.initHot().loadData()
  }

  get codeSheet() {
    return this.getNode("CodeSheetComponent")
  }

  getGrammarCode() {
    return this.grammarInstance.getValue()
  }

  setGrammarCode(code: string) {
    this.grammarInstance.setValue(code)
  }

  setCodeCode(code: string) {
    this.codeInstance.setValue(code)
  }

  getCodeValue() {
    return this.codeInstance.getValue()
  }

  private async _restoreFromLocalStorage() {
    console.log("Restoring from local storage....")
    const grammarCode: any = localStorage.getItem(this._localStorageKeys.grammarConsole)
    const code = localStorage.getItem(this._localStorageKeys.codeConsole)

    if (typeof grammarCode === "string" && typeof code === "string") this._setGrammarAndCode(grammarCode, code)

    return grammarCode || code
  }

  private _updateLocalStorage() {
    localStorage.setItem(this._localStorageKeys.grammarConsole, this.getGrammarCode())
    localStorage.setItem(this._localStorageKeys.codeConsole, this.getCodeValue())
    this._updateShareLink() // todo: where to put this?
    console.log("Local storage updated...")
  }

  private _getGrammarErrors(grammarCode: string) {
    return new grammarNode(grammarCode).getAllErrors()
  }

  private _getGrammarConstructor() {
    let currentGrammarCode = this.getGrammarCode()

    if (!this._grammarConstructor || currentGrammarCode !== this._cachedGrammarCode) {
      try {
        this._grammarConstructor = new jtree.HandGrammarProgram(currentGrammarCode).compileAndReturnRootConstructor()
        this._cachedGrammarCode = currentGrammarCode
        this.willowBrowser.setHtmlOfElementWithIdHack("ErrorDisplayComponent")
      } catch (err) {
        console.error(err)
        this.willowBrowser.setHtmlOfElementWithIdHack("ErrorDisplayComponent", err)
      }
    }
    return this._grammarConstructor
  }

  protected onCommandError(err: any) {
    console.log(err)
    this.willowBrowser.setHtmlOfElementWithIdHack("ErrorDisplayComponent", err)
  }

  private _grammarDidUpdate() {
    const grammarCode = this.getGrammarCode()
    this._updateLocalStorage()
    this.grammarProgram = new grammarNode(grammarCode)
    const errs = this.grammarProgram.getAllErrors().map((err: any) => err.toObject())
    this.willowBrowser.setHtmlOfElementWithIdHack("grammarErrorsConsole", errs.length ? new jtree.TreeNode(errs).toFormattedTable(200) : "0 errors")
    const grammarProgram = new jtree.HandGrammarProgram(this.grammarInstance.getValue())
    const readme = new dumbdownNode(grammarProgram.toReadMe()).compile()

    this.willowBrowser.setHtmlOfElementWithIdHack("readmeComponent", readme)
  }

  private _updateShareLink() {
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

    this.program = new programConstructor(code)
    const errs = this.program.getAllErrors()

    willowBrowser.setHtmlOfElementWithIdHack("codeErrorsConsole", errs.length ? new jtree.TreeNode(errs.map((err: any) => err.toObject())).toFormattedTable(200) : "0 errors")

    const cursor = this.codeInstance.getCursor()

    // todo: what if 2 errors?
    this.codeInstance.operation(() => {
      this.codeWidgets.forEach(widget => this.codeInstance.removeLineWidget(widget))
      this.codeWidgets.length = 0

      errs
        .filter((err: any) => !err.isBlankLineError())
        .filter((err: any) => !err.isCursorOnWord(cursor.line, cursor.ch))
        .slice(0, 1) // Only show 1 error at a time. Otherwise UX is not fun.
        .forEach((err: any) => {
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

  _setGrammarAndCode(grammar: string, code: string) {
    this.setGrammarCode(grammar)
    this.setCodeCode(code)
    this._clearHash()
    this._grammarDidUpdate()
    this._clearResults()
    this._onCodeKeyUp()
    this.codeSheet
      .destroy()
      .initHot()
      .loadData()
  }

  toHakonCode() {
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

export { DesignerApp }
