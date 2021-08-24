//onsave jtree build produce DesignerApp.browser.js

const { AbstractTreeComponent, TreeComponentFrameworkDebuggerComponent } = require("../../products/TreeComponentFramework.node.js")
const { jtree } = require("../../index.js")

const { GithubTriangleComponent } = require("./GitHubTriangle.ts")
const { SamplesComponent } = require("./Samples.ts")
const { ShareComponent } = require("./Share.ts")
const { HeaderComponent } = require("./Header.ts")
const { ErrorDisplayComponent } = require("./ErrorDisplay.ts")
const { GrammarWorkspaceComponent } = require("./GrammarWorkspace.ts")
const { CodeWorkspaceComponent } = require("./CodeWorkspace.ts")
const { FooterComponent } = require("./Footer.ts")
const { CodeSheetComponent } = require("./CodeSheet.ts")

import { GrammarProvider, CodeAndGrammarApp, LocalStorageKeys } from "./Types"

class DesignerApp extends AbstractTreeComponent implements GrammarProvider, CodeAndGrammarApp {
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

  async start() {
    this._bindTreeComponentFrameworkCommandListenersOnBody()
    this.renderAndGetRenderReport(this.willowBrowser.getBodyStumpNode())

    this.grammarWorkspace.initCodeMirror()
    this.codeWorkspace.initCodeMirror()
    this.codeSheet.initHot().loadData()

    // loadFromURL
    const wasLoadedFromDeepLink = await this._loadFromDeepLink()
    if (!wasLoadedFromDeepLink) await this._restoreFromLocalStorage()
  }

  private async _restoreFromLocalStorage() {
    console.log("Restoring from local storage....")
    const grammarCode: any = localStorage.getItem(LocalStorageKeys.grammarConsole)
    const code = localStorage.getItem(LocalStorageKeys.codeConsole)

    if (typeof grammarCode === "string" && typeof code === "string") this._setGrammarAndCode(grammarCode, code)

    return grammarCode || code
  }

  protected onCommandError(err: any) {
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
    return <typeof CodeSheetComponent>this.getNode("CodeSheetComponent")
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
  }

  postGrammarKeyup() {
    // Hack to break CM cache:
    const val = this.codeWorkspace.code
    this.codeWorkspace.setCode("\n" + val)
    this.codeWorkspace.setCode(val)
    this.updateShareLink()
  }

  _setGrammarAndCode(grammar: string, code: string) {
    this.grammarWorkspace.setCode(grammar)
    this.codeWorkspace.setCode(code)
    this._clearHash()
    this.codeSheet.refresh()
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

export { DesignerApp }
