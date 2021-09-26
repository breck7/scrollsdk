const { AbstractTreeComponent } = require("../../products/TreeComponentFramework.node.js")
const { jtree } = require("../../index.js")

import { CodeAndGrammarApp } from "./Types"

const isEmpty = (val: any) => val === ""

declare var Handsontable: any

interface ParsedCell {
  cssClasses?: string[]
  optionKeywords?: string[]
  comment?: string
  placeholder?: string
  contents?: string
}

class CodeSheetComponent extends AbstractTreeComponent {
  updateProgramFromHot() {}

  hotInstance: any

  refreshData() {
    if (this.hotInstance) this.hotInstance.loadData(this.rectangularGrid)
  }

  get app() {
    return <CodeAndGrammarApp>this.getParent()
  }

  get grid() {
    return new jtree.TreeNode(this.app.codeCode).toGrid()
  }

  get rectangularGrid() {
    const { grid } = this
    const minWidth = this.program.getProgramWidth()
    grid.forEach((line: any) => {
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

  getParsedCell(row: number, column: number): ParsedCell {
    const { program } = this
    const theRow = program.getProgramAsCells()[row]
    const cellTypes = new jtree.TreeNode(program.toCellTypeTreeWithNodeConstructorNames())
    const rootCellTypes = new jtree.TreeNode(program.toPreludeCellTypeTreeWithNodeConstructorNames())

    const cell = theRow ? theRow[column] : undefined
    if (!cell) return {}
    const cssClasses: string[] = [(cell.getHighlightScope() || "").replaceAll(".", "") + "Cell"]
    if (!cell.isValid()) cssClasses.push("CellHasErrorsClass")
    const contents = cell.getWord()
    const cellTypeName = cellTypes.nodeAt(row).getWord(column + 1)
    const rootCellType = rootCellTypes.nodeAt(row).getWord(column + 1)
    const cellTypeAncestry = `${cellTypeName} < ${rootCellType}` // todo: add full ancestry
    const nodeType = cellTypes.nodeAt(row).getWord(0)
    return {
      optionKeywords: cell.getAutoCompleteWords().map((word: any) => word.text),
      placeholder: isEmpty(contents) && cell.placeholder ? `eg "${cell.placeholder}"` : "",
      contents,
      cssClasses,
      comment: contents ? `${nodeType}\n${cellTypeAncestry}` : undefined
    }
    return cell
  }

  private get hotSettings() {
    const that = this

    const cells = function(row: number, column: number) {
      const { comment, cssClasses, optionKeywords, placeholder } = that.getParsedCell(row, column)
      const cellProperties: Partial<any> = {}

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

    const hotSettings: any = {
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

export { CodeSheetComponent }
