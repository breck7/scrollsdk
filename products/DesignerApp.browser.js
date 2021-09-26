"use strict"
const isEmpty = val => val === ""
class CodeSheetComponent extends AbstractTreeComponent {
  updateProgramFromHot() {}
  refreshData() {
    if (this.hotInstance) this.hotInstance.loadData(this.rectangularGrid)
  }
  get app() {
    return this.getParent()
  }
  get grid() {
    return new jtree.TreeNode(this.app.codeCode).toGrid()
  }
  get rectangularGrid() {
    const { grid } = this
    const minWidth = this.program.getProgramWidth()
    grid.forEach(line => {
      // workaround for: https://github.com/handsontable/handsontable/issues/7361
      while (line.length < minWidth) line.push("")
    })
    return grid
  }
  destroy() {
    if (this.hotInstance) this.hotInstance.destroy()
    return this
  }
  refreshAll() {
    this.destroy()
      .initHot()
      .refreshData()
  }
  initHot() {
    if (!this.program) return this
    this.hotInstance = new Handsontable(document.getElementById("HotHolder"), this.hotSettings)
    return this
  }
  get program() {
    return this.app.program
  }
  getParsedCell(row, column) {
    const { program } = this
    const theRow = program.getProgramAsCells()[row]
    const cellTypes = new jtree.TreeNode(program.toCellTypeTreeWithNodeConstructorNames())
    const rootCellTypes = new jtree.TreeNode(program.toPreludeCellTypeTreeWithNodeConstructorNames())
    const cell = theRow ? theRow[column] : undefined
    if (!cell) return {}
    const cssClasses = [(cell.getHighlightScope() || "").replaceAll(".", "") + "Cell"]
    if (!cell.isValid()) cssClasses.push("CellHasErrorsClass")
    const contents = cell.getWord()
    const cellTypeName = cellTypes.nodeAt(row).getWord(column + 1)
    const rootCellType = rootCellTypes.nodeAt(row).getWord(column + 1)
    const cellTypeAncestry = `${cellTypeName} < ${rootCellType}` // todo: add full ancestry
    const nodeType = cellTypes.nodeAt(row).getWord(0)
    return {
      optionKeywords: cell.getAutoCompleteWords().map(word => word.text),
      placeholder: isEmpty(contents) && cell.placeholder ? `eg "${cell.placeholder}"` : "",
      contents,
      cssClasses,
      comment: contents ? `${nodeType}\n${cellTypeAncestry}` : undefined
    }
    return cell
  }
  get hotSettings() {
    const that = this
    const cells = function(row, column) {
      const { comment, cssClasses, optionKeywords, placeholder } = that.getParsedCell(row, column)
      const cellProperties = {}
      const allClasses = cssClasses ? cssClasses.slice() : []
      cellProperties.className = allClasses.join(" ")
      cellProperties.comment = comment ? { value: comment } : undefined
      cellProperties.placeholder = placeholder
      if (optionKeywords && optionKeywords.length) {
        cellProperties.type = "autocomplete"
        cellProperties.source = optionKeywords
      }
      return cellProperties
    }
    const hotSettings = {
      afterChange: () => this.updateProgramFromHot(),
      afterRemoveRow: () => this.updateProgramFromHot(),
      afterRemoveCol: () => this.updateProgramFromHot(),
      allowInsertColumn: false,
      allowInsertRow: true,
      autoRowSize: false,
      autoColumnSize: false,
      colHeaders: true,
      comments: true,
      cells,
      contextMenu: {
        items: {
          sp0: { name: "---------" },
          row_above: {},
          row_below: {},
          sp1: { name: "---------" },
          remove_row: {},
          remove_col: {},
          sp2: { name: "---------" },
          undo: {},
          redo: {},
          sp3: { name: "---------" },
          copy: {},
          cut: {}
        }
      },
      licenseKey: "non-commercial-and-evaluation",
      height: 500,
      manualColumnResize: true,
      manualRowMove: true,
      minCols: this.program.getProgramWidth() + 3,
      minSpareCols: 2,
      minRows: 40,
      minSpareRows: 20,
      rowHeaders: true,
      search: true,
      stretchH: "all",
      width: "100%",
      wordWrap: false
    }
    return hotSettings
  }
  toStumpCode() {
    return `div
 id CodeSheetComponent
 div
  class CodeSheetToolbarComponent
 div CODESHEET GOES HERE
  id HotHolder`
  }
}
window.CodeSheetComponent = CodeSheetComponent
class CodeToolbarComponent extends AbstractTreeComponent {
  toStumpCode() {
    return `div
 class CodeToolbarComponent
 div Source Code in your Language
 div
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
   clickCommand visualizeCommand`
  }
}
class CodeEditorComponent extends AbstractTreeComponent {
  constructor() {
    super(...arguments)
    this.codeWidgets = []
  }
  toStumpCode() {
    return `textarea
 id codeConsole`
  }
  get workspace() {
    return this.getParent()
  }
  initCodeMirror() {
    this.codeMirrorInstance = new jtree.TreeNotationCodeMirrorMode("custom", () => this.workspace.grammarConstructor, undefined, CodeMirror)
      .register()
      .fromTextAreaWithAutocomplete(document.getElementById("codeConsole"), { lineWrapping: true })
    this.codeMirrorInstance.on("keyup", () => this.onCodeKeyUp())
    this.codeMirrorInstance.setSize(undefined, 500)
  }
  onCodeKeyUp() {
    const { workspace, willowBrowser } = this
    workspace.onCodeKeyUp()
    const cursor = this.codeMirrorInstance.getCursor()
    const errs = workspace.program.getAllErrors()
    // todo: what if 2 errors?
    this.codeMirrorInstance.operation(() => {
      this.codeWidgets.forEach(widget => this.codeMirrorInstance.removeLineWidget(widget))
      this.codeWidgets.length = 0
      errs
        .filter(err => !err.isBlankLineError())
        .filter(err => !err.isCursorOnWord(cursor.line, cursor.ch))
        .slice(0, 1) // Only show 1 error at a time. Otherwise UX is not fun.
        .forEach(err => {
          const el = err.getCodeMirrorLineWidgetElement(() => {
            this.codeMirrorInstance.setValue(this.program.toString())
            this.onCodeKeyUp()
          })
          this.codeWidgets.push(this.codeMirrorInstance.addLineWidget(err.getLineNumber() - 1, el, { coverGutter: false, noHScroll: false }))
        })
      const info = this.codeMirrorInstance.getScrollInfo()
      const after = this.codeMirrorInstance.charCoords({ line: cursor.line + 1, ch: 0 }, "local").top
      if (info.top + info.clientHeight < after) this.codeMirrorInstance.scrollTo(null, after - info.clientHeight + 3)
    })
    willowBrowser.setHtmlOfElementWithIdHack("codeErrorsConsole", errs.length ? `${errs.length} language errors\n` + new jtree.TreeNode(errs.map(err => err.toObject())).toFormattedTable(200) : "0 language errors")
    if (willowBrowser.getElementById("visualizeCommand").checked) this.visualizeCommand()
    if (willowBrowser.getElementById("compileCommand").checked) this.compileCommand()
    if (willowBrowser.getElementById("executeCommand").checked) this.executeCommand()
  }
  setCode(code) {
    this.codeMirrorInstance.setValue(code)
    this.onCodeKeyUp()
  }
  get code() {
    return this.codeMirrorInstance.getValue()
  }
}
class CodeErrorBarComponent extends AbstractTreeComponent {
  toStumpCode() {
    return `pre
 id codeErrorsConsole`
  }
}
class CompiledResultsComponent extends AbstractTreeComponent {
  toStumpCode() {
    return `textarea
 class resultsDiv
 id compileResultsDiv
 placeholder Compilation results`
  }
}
class ExecutionResultsComponent extends AbstractTreeComponent {
  toHakonCode() {
    return `#execResultsTextArea
 border 0
 width 100%`
  }
  toStumpCode() {
    return `textarea
 class resultsDiv
 id executeResultsDiv
 placeholder Execution results`
  }
}
class ExplainResultsComponent extends AbstractTreeComponent {
  toStumpCode() {
    return `div
 class resultsDiv
 style position:relative;
 id explainResultsDiv`
  }
}
class CodeWorkspaceComponent extends AbstractTreeComponent {
  createParser() {
    return new jtree.TreeNode.Parser(undefined, {
      CodeEditorComponent,
      CodeToolbarComponent,
      CodeErrorBarComponent,
      CompiledResultsComponent,
      ExecutionResultsComponent,
      ExplainResultsComponent
    })
  }
  initCodeMirror() {
    this.editor.initCodeMirror()
  }
  _updateLocalStorage() {
    localStorage.setItem(LocalStorageKeys.codeConsole, this.code)
  }
  // todo: figure out how to type this, where we can specify an interface a root parent must implement.
  // it is a little messy with the typescript/js/tree notation spaghettiness.
  // Assumes root parent has a getter `grammarConstructor`
  get grammarProvider() {
    return this.getParent()
  }
  get designerApp() {
    return this.getParent()
  }
  get grammarConstructor() {
    return this.grammarProvider.grammarConstructor
  }
  onCodeKeyUp() {
    const { willowBrowser, code } = this
    this._updateLocalStorage()
    const programConstructor = this.grammarConstructor
    this.program = new programConstructor(code)
    this.designerApp.postCodeKeyup()
  }
  get editor() {
    return this.getNode("CodeEditorComponent")
  }
  get code() {
    return this.editor.code
  }
  setCode(str) {
    this.editor.setCode(str)
    this._clearResults()
  }
  _clearResults() {
    this.willowBrowser.setHtmlOfElementsWithClassHack("resultsDiv")
    this.willowBrowser.setValueOfElementsWithClassHack("resultsDiv")
  }
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
  toHakonCode() {
    return `textarea.resultsDiv
 height 120px
 width 220px
 border 0
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
     color rgba(1,1,1,.5)`
  }
}
window.CodeWorkspaceComponent = CodeWorkspaceComponent
//onsave jtree build produce DesignerApp.browser.js
class DesignerApp extends AbstractTreeComponent {
  createParser() {
    return new jtree.TreeNode.Parser(undefined, {
      TreeComponentFrameworkDebuggerComponent,
      GithubTriangleComponent,
      SamplesComponent,
      ShareComponent,
      HeaderComponent,
      ErrorDisplayComponent,
      GrammarWorkspaceComponent,
      CodeWorkspaceComponent,
      FooterComponent,
      CodeSheetComponent
    })
  }
  resetCommand() {
    Object.values(LocalStorageKeys).forEach(val => localStorage.removeItem(val))
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
  async start() {
    this._bindTreeComponentFrameworkCommandListenersOnBody()
    this.renderAndGetRenderReport(this.willowBrowser.getBodyStumpNode())
    this.grammarWorkspace.initCodeMirror()
    this.codeWorkspace.initCodeMirror()
    this.codeSheet.initHot().refreshData()
    // loadFromURL
    const wasLoadedFromDeepLink = await this._loadFromDeepLink()
    if (!wasLoadedFromDeepLink) await this._restoreFromLocalStorage()
  }
  async _restoreFromLocalStorage() {
    console.log("Restoring from local storage....")
    const grammarCode = localStorage.getItem(LocalStorageKeys.grammarConsole)
    const code = localStorage.getItem(LocalStorageKeys.codeConsole)
    if (typeof grammarCode === "string" && typeof code === "string") this._setGrammarAndCode(grammarCode, code)
    return grammarCode || code
  }
  onCommandError(err) {
    console.log(err)
    this.willowBrowser.setHtmlOfElementWithIdHack("ErrorDisplayComponent", err)
  }
  get grammarConstructor() {
    return this.grammarWorkspace.grammarConstructor
  }
  get grammarWorkspace() {
    return this.getNode("GrammarWorkspaceComponent")
  }
  get codeWorkspace() {
    return this.getNode("CodeWorkspaceComponent")
  }
  get codeSheet() {
    return this.getNode("CodeSheetComponent")
  }
  get codeCode() {
    return this.codeWorkspace.code
  }
  get grammarCode() {
    return this.grammarWorkspace.code
  }
  get program() {
    const programConstructor = this.grammarConstructor
    return new programConstructor(this.codeCode)
  }
  synthesizeProgramCommand() {
    this.codeWorkspace.setCode(
      new jtree.HandGrammarProgram(this.grammarCode)
        .getRootNodeTypeDefinitionNode()
        .synthesizeNode()
        .join("\n")
    )
  }
  updateShareLink() {
    this.getNode("ShareComponent").updateShareLink()
  }
  postCodeKeyup() {
    this.updateShareLink()
    this.codeSheet.refreshData()
  }
  postGrammarKeyup() {
    // Hack to break CM cache:
    const val = this.codeWorkspace.code
    this.codeWorkspace.setCode("\n" + val)
    this.codeWorkspace.setCode(val)
    this.updateShareLink()
  }
  _setGrammarAndCode(grammar, code) {
    this.grammarWorkspace.setCode(grammar)
    this.codeWorkspace.setCode(code)
    this._clearHash()
    this.codeSheet.refreshAll()
  }
  toHakonCode() {
    return `body
 font-family "San Francisco", "Myriad Set Pro", "Lucida Grande", "Helvetica Neue", Helvetica, Arial, Verdana, sans-serif
 margin auto
 max-width 1400px
 font-size 14px
 background #eee
 color rgba(1, 47, 52, 1)
 padding-top 5px
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
code
 white-space pre
pre
 overflow auto
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
window.DesignerApp = DesignerApp
class ErrorDisplayComponent extends AbstractTreeComponent {
  toStumpCode() {
    return `div
 id ErrorDisplayComponent`
  }
  toHakonCode() {
    return `#ErrorDisplayComponent
 color red`
  }
}
window.ErrorDisplayComponent = ErrorDisplayComponent
class FooterComponent extends AbstractTreeComponent {
  toStumpCode() {
    return `div Made with <3 for the Public Domain
 class FooterComponent`
  }
}
window.FooterComponent = FooterComponent
class GithubTriangleComponent extends AbstractGithubTriangleComponent {
  constructor() {
    super(...arguments)
    this.githubLink = `https://github.com/treenotation/jtree/tree/main/designer`
  }
}
window.GithubTriangleComponent = GithubTriangleComponent
class GrammarToolbarComponent extends AbstractTreeComponent {
  toStumpCode() {
    return `div
 class GrammarToolbarComponent
 div Grammar for your Tree Language
 div
  a Infer Prefix Grammar
   clickCommand inferPrefixGrammarCommand
  span  | 
  a Download Bundle
   clickCommand downloadBundleCommand
  span  | 
  a Synthesize Program
   clickCommand synthesizeProgramCommand
  span  | 
  a Generate Readme
   clickCommand generateReadmeCommand`
  }
  get grammarWorkspace() {
    return this.getParent()
  }
  get code() {
    return this.grammarWorkspace.code
  }
  inferPrefixGrammarCommand() {
    this.grammarWorkspace.setCode(new jtree.UnknownGrammarProgram(this.code).inferGrammarFileForAKeywordLanguage("inferredLanguage"))
  }
  // TODO: ADD TESTS!!!!!
  async downloadBundleCommand() {
    const grammarProgram = new jtree.HandGrammarProgram(this.code)
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
}
class GrammarEditorComponent extends AbstractTreeComponent {
  toStumpCode() {
    return `textarea
 id grammarConsole`
  }
  initCodeMirror() {
    this.codeMirrorInstance = new jtree.TreeNotationCodeMirrorMode("grammar", () => grammarNode, undefined, CodeMirror).register().fromTextAreaWithAutocomplete(document.getElementById("grammarConsole"), { lineWrapping: true })
    this.codeMirrorInstance.on("keyup", () => {
      this.workspace.onKeyUp()
    })
    this.codeMirrorInstance.setSize(undefined, 500)
  }
  get workspace() {
    return this.getParent()
  }
  get code() {
    return this.codeMirrorInstance.getValue()
  }
  setCode(code) {
    this.codeMirrorInstance.setValue(code)
  }
}
class GrammarErrorBarComponent extends AbstractTreeComponent {
  toStumpCode() {
    return `pre
 id grammarErrorsConsole`
  }
}
class GrammarReadmeComponent extends AbstractTreeComponent {
  toStumpCode() {
    return `div
 id readmeComponent`
  }
}
class GrammarWorkspaceComponent extends AbstractTreeComponent {
  createParser() {
    return new jtree.TreeNode.Parser(undefined, {
      GrammarToolbarComponent,
      GrammarEditorComponent,
      GrammarErrorBarComponent,
      GrammarReadmeComponent
    })
  }
  initCodeMirror() {
    this.editor.initCodeMirror()
  }
  onKeyUp() {
    this._grammarDidUpdate()
    this.designerApp.postGrammarKeyup()
  }
  get code() {
    return this.editor.code
  }
  setCode(str) {
    this.editor.setCode(str)
    this._grammarDidUpdate()
  }
  get designerApp() {
    return this.getParent()
  }
  get grammarConstructor() {
    let currentGrammarCode = this.code
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
  get editor() {
    return this.getNode("GrammarEditorComponent")
  }
  _getGrammarErrors(grammarCode) {
    return new grammarNode(grammarCode).getAllErrors()
  }
  _updateLocalStorage() {
    localStorage.setItem(LocalStorageKeys.grammarConsole, this.code)
  }
  _grammarDidUpdate() {
    this._updateLocalStorage()
    this.grammarProgram = new grammarNode(this.code)
    this._updateErrorConsole()
    this._clearReadme()
  }
  _updateErrorConsole() {
    const errs = this.grammarProgram.getAllErrors().map(err => err.toObject())
    this.willowBrowser.setHtmlOfElementWithIdHack("grammarErrorsConsole", errs.length ? `${errs.length} grammar errors\n` + new jtree.TreeNode(errs).toFormattedTable(200) : "0 grammar errors")
  }
  _clearReadme() {
    this.willowBrowser.setHtmlOfElementWithIdHack("readmeComponent", "")
  }
  generateReadmeCommand() {
    const grammarProgram = new jtree.HandGrammarProgram(this.code)
    const readme = new dumbdownNode(grammarProgram.toReadMe()).compile()
    this.willowBrowser.setHtmlOfElementWithIdHack("readmeComponent", readme)
  }
}
window.GrammarWorkspaceComponent = GrammarWorkspaceComponent
class HeaderComponent extends AbstractTreeComponent {
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
 class HeaderComponent
 div
  span ${this._getTitle()}
   class ProductName
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
window.HeaderComponent = HeaderComponent
// http://localhost:3333/designer/#url%20https://simoji.pub/simoji.grammar
// http://localhost:3333/designer/#url%20https://scroll.pub/scrolldown.grammar
class SamplesComponent extends AbstractTreeComponent {
  constructor() {
    super(...arguments)
    this.languages = "newlang hakon stump dumbdown arrow dug iris fire chuck wwt swarm project stamp grammar config jibberish numbers poop".split(" ")
  }
  toStumpCode() {
    const langs = this.languages
      .map(
        lang => ` a ${jtree.Utils.ucfirst(lang)}
  href #standard%20${lang}
  value ${lang}
  clickCommand fetchAndLoadJtreeShippedLanguageCommand`
      )
      .join("\n span  | \n")
    return `p
 class SamplesComponent
 span Example Languages 
${langs}`
  }
}
window.SamplesComponent = SamplesComponent
class ShareComponent extends AbstractTreeComponent {
  updateShareLink() {
    const url = new URL(location.href)
    url.hash = ""
    const base = url.toString()
    this.willowBrowser.setValueOfElementWithIdHack("shareLink", base + this.toShareLink())
  }
  get app() {
    return this.getParent()
  }
  toShareLink() {
    const tree = new jtree.TreeNode()
    tree.appendLineAndChildren("grammar", this.app.grammarCode)
    tree.appendLineAndChildren("sample", this.app.codeCode)
    return "#" + encodeURIComponent(tree.toString())
  }
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
  font-size 14px
  color #222
  padding 5px
  background-color #ddd
  border-radius 5px
  border 0
  width calc(100% - 70px)`
  }
}
window.ShareComponent = ShareComponent
const LocalStorageKeys = {
  grammarConsole: "grammarConsole",
  codeConsole: "codeConsole"
}
window.LocalStorageKeys = LocalStorageKeys
