import TreeNode from "../base/TreeNode"

import { GrammarConstants } from "./GrammarConstants"

class UnknownGrammarNode extends TreeNode {
  protected getGrammarStuff() {
    const xi = this.getXI()
    const myKeywords = this.getColumnNames()

    const cellTypeDefinitions: string[] = []

    const keywordDefinitions = myKeywords //this.getInvalidKeywords()
      .map((keyword: string) => {
        const lines = this.getColumn(keyword).filter(i => i)
        const cells = lines.map(line => line.split(xi))
        const sizes = new Set(cells.map(c => c.length))
        const max = Math.max(...Array.from(sizes))
        const min = Math.min(...Array.from(sizes))
        let catchAllCellType: string
        let cellTypes = []
        for (let index = 0; index < max; index++) {
          const set = new Set(cells.map(c => c[index]))
          const values = Array.from(set).filter(c => c)
          const type = this._getBestType(values)
          cellTypes.push(type)
        }
        if (max > min) {
          //columns = columns.slice(0, min)
          catchAllCellType = cellTypes.pop()
          while (cellTypes[cellTypes.length - 1] === catchAllCellType) {
            cellTypes.pop()
          }
        }

        const catchAllCellTypeString = catchAllCellType
          ? `\n ${GrammarConstants.catchAllCellType} ${catchAllCellType}`
          : ""

        const childrenAnyString = this.isLeafColumn(keyword) ? "" : `\n ${GrammarConstants.any}`

        if (!cellTypes.length)
          return `${GrammarConstants.keyword} ${keyword}${catchAllCellTypeString}${childrenAnyString}`

        if (cellTypes.length > 1)
          return `${GrammarConstants.keyword} ${keyword}
 ${GrammarConstants.cells} ${cellTypes.join(xi)}${catchAllCellTypeString}${childrenAnyString}`

        return `${GrammarConstants.keyword} ${keyword} ${cellTypes[0]}${catchAllCellTypeString}${childrenAnyString}`
      })

    return {
      keywordDefinitions: keywordDefinitions,
      cellTypeDefinitions: cellTypeDefinitions
    }
  }

  protected _getBestType(values: any) {
    const all = (fn: Function) => {
      for (let i = 0; i < values.length; i++) {
        if (!fn(values[i])) return false
      }
      return true
    }
    if (all((str: string) => str === "0" || str === "1")) return "bit"

    if (
      all((str: string) => {
        const num = parseInt(str)
        if (isNaN(num)) return false
        return num.toString() === str
      })
    ) {
      return "int"
    }

    if (all((str: string) => !str.match(/[^\d\.\-]/))) return "float"

    const bools = new Set(["1", "0", "true", "false", "t", "f", "yes", "no"])
    if (all((str: string) => bools.has(str.toLowerCase()))) return "bool"

    return "any"
  }
}

class UnknownGrammarProgram extends UnknownGrammarNode {
  getPredictedGrammarFile(grammarName: string): string {
    const rootNode = new TreeNode(`grammar
 name ${grammarName}`)

    this.getColumnNames().forEach(keyword => rootNode.touchNode(`grammar keywords ${keyword}`))
    const gram = this.getGrammarStuff()
    const yi = this.getYI()

    return rootNode.toString() + "\n" + gram.cellTypeDefinitions.join(yi) + gram.keywordDefinitions.join(yi)
  }
}

class UnknownGrammarProgramNonRootNode extends UnknownGrammarNode {}

export default UnknownGrammarProgram
