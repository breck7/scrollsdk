const { AbstractTreeComponent } = require("../../products/TreeComponentFramework.node.js")
const { jtree } = require("../../index.js")
const { CodeSheetComponent } = require("./CodeSheet.ts")

import { GrammarProvider, LocalStorageKeys, EditorWorkspace } from "./Types"

declare var CodeMirror: any

class CodeToolbarComponent extends AbstractTreeComponent {
  toStumpCode() {
    return `span Source Code in your Language
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
  toStumpCode() {
    return `textarea
 id codeConsole`
  }

  private codeMirrorInstance: any
  private codeWidgets: any[] = []

  get workspace() {
    return <CodeWorkspaceComponent>this.getParent()
  }

  initCodeMirror() {
    this.codeMirrorInstance = new jtree.TreeNotationCodeMirrorMode("custom", () => this.workspace.grammarConstructor, undefined, CodeMirror)
      .register()
      .fromTextAreaWithAutocomplete(document.getElementById("codeConsole"), { lineWrapping: true })

    this.codeMirrorInstance.on("keyup", () => this.onCodeKeyUp())
  }

  private onCodeKeyUp() {
    const { workspace, willowBrowser } = this
    workspace.onCodeKeyUp()

    const cursor = this.codeMirrorInstance.getCursor()

    const errs = workspace.program.getAllErrors()

    // todo: what if 2 errors?
    this.codeMirrorInstance.operation(() => {
      this.codeWidgets.forEach(widget => this.codeMirrorInstance.removeLineWidget(widget))
      this.codeWidgets.length = 0

      errs
        .filter((err: any) => !err.isBlankLineError())
        .filter((err: any) => !err.isCursorOnWord(cursor.line, cursor.ch))
        .slice(0, 1) // Only show 1 error at a time. Otherwise UX is not fun.
        .forEach((err: any) => {
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

    willowBrowser.setHtmlOfElementWithIdHack("codeErrorsConsole", errs.length ? `${errs.length} language errors\n` + new jtree.TreeNode(errs.map((err: any) => err.toObject())).toFormattedTable(200) : "0 language errors")

    if (willowBrowser.getElementById("visualizeCommand").checked) this.visualizeCommand()
    if (willowBrowser.getElementById("compileCommand").checked) this.compileCommand()
    if (willowBrowser.getElementById("executeCommand").checked) this.executeCommand()
  }

  setCode(code: string) {
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

class CodeWorkspaceComponent extends AbstractTreeComponent implements EditorWorkspace {
  createParser() {
    return new jtree.TreeNode.Parser(undefined, {
      CodeEditorComponent,
      CodeToolbarComponent,
      CodeErrorBarComponent,
      CodeSheetComponent,
      CompiledResultsComponent,
      ExecutionResultsComponent,
      ExplainResultsComponent
    })
  }

  initCodeMirror() {
    this.editor.initCodeMirror()
    this.codeSheet.initHot().loadData()
  }

  private _updateLocalStorage() {
    localStorage.setItem(LocalStorageKeys.codeConsole, this.code)
  }

  // todo: figure out how to type this, where we can specify an interface a root parent must implement.
  // it is a little messy with the typescript/js/tree notation spaghettiness.
  // Assumes root parent has a getter `grammarConstructor`
  get grammarProvider() {
    return <GrammarProvider>this.getParent()
  }

  get grammarConstructor() {
    return this.grammarProvider.grammarConstructor
  }

  onCodeKeyUp() {
    const { willowBrowser, code } = this
    this._updateLocalStorage()
    const programConstructor = this.grammarConstructor

    this.program = new programConstructor(code)
  }

  get editor(): CodeEditorComponent {
    return this.getNode("CodeEditorComponent")
  }

  get code() {
    return this.editor.code
  }

  setCode(str: string) {
    this.editor.setCode(str)
    this._clearResults()
    this.codeSheet
      .destroy()
      .initHot()
      .loadData()
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

  get codeSheet() {
    return <typeof CodeSheetComponent>this.getNode("CodeSheetComponent")
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

  toHakonCode() {
    return `textarea.resultsDiv
 height 120px
 width 220px
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

export { CodeWorkspaceComponent }
