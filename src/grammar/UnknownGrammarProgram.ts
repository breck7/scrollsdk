import TreeNode from "../base/TreeNode"

import { GrammarConstants } from "./GrammarConstants"

class UnknownGrammarNode extends TreeNode {
  protected getGrammarStuff() {
    const xi = this.getXI()
    const myKeywords = this.getColumnNames()

    const cellTypeDefinitions: string[] = []
    const definedCellTypes: { [cellTypeName: string]: boolean } = {}

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
          const cellType = this._getBestCellType(keyword, cells.map(c => c[index]))
          if (cellType.cellTypeDefinition && !definedCellTypes[cellType.cellTypeName]) {
            cellTypeDefinitions.push(cellType.cellTypeDefinition)
            definedCellTypes[cellType.cellTypeName] = true
          }
          cellTypes.push(cellType.cellTypeName)
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

        if (catchAllCellTypeString)
          return `${GrammarConstants.keyword} ${keyword} ${catchAllCellTypeString}${childrenAnyString}`
        else
          return `${GrammarConstants.keyword} ${keyword}
 ${GrammarConstants.cells} ${cellTypes[0]}${childrenAnyString}`
      })

    return {
      keywordDefinitions: keywordDefinitions,
      cellTypeDefinitions: cellTypeDefinitions
    }
  }

  protected _getBestCellType(keyword: string, allValues: any[]): { cellTypeName: string; cellTypeDefinition?: string } {
    const asSet = new Set(allValues)
    const xi = this.getXI()
    const values = Array.from(asSet).filter(c => c)
    const all = (fn: Function) => {
      for (let i = 0; i < values.length; i++) {
        if (!fn(values[i])) return false
      }
      return true
    }
    if (all((str: string) => str === "0" || str === "1")) return { cellTypeName: "bit" }

    if (
      all((str: string) => {
        const num = parseInt(str)
        if (isNaN(num)) return false
        return num.toString() === str
      })
    ) {
      return { cellTypeName: "int" }
    }

    if (all((str: string) => !str.match(/[^\d\.\-]/))) return { cellTypeName: "float" }

    const bools = new Set(["1", "0", "true", "false", "t", "f", "yes", "no"])
    if (all((str: string) => bools.has(str.toLowerCase()))) return { cellTypeName: "bool" }

    // If there are duplicate files and the set is less than enum
    const enumLimit = 30
    if ((asSet.size === 1 || allValues.length > asSet.size) && asSet.size < enumLimit)
      return {
        cellTypeName: `${keyword}Enum`,
        cellTypeDefinition: `cellType ${keyword}Enum
 enum ${values.join(xi)}`
      }

    return { cellTypeName: "any" }
  }
}

class UnknownGrammarProgram extends UnknownGrammarNode {
  getPredictedGrammarFile(grammarName: string): string {
    const rootNode = new TreeNode(`grammar
 name ${grammarName}`)

    this.getColumnNames().forEach(keyword => rootNode.touchNode(`grammar keywords ${keyword}`))
    const gram = this.getGrammarStuff()
    const yi = this.getYI()

    return [rootNode.toString(), gram.cellTypeDefinitions.join(yi), gram.keywordDefinitions.join(yi)]
      .filter(i => i)
      .join("\n")
  }
}

class UnknownGrammarProgramNonRootNode extends UnknownGrammarNode {}

export default UnknownGrammarProgram
