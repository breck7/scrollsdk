import { TreeNode } from "./TreeNode"
import { TreeUtils } from "./TreeUtils"

import { GrammarConstants, GrammarProgram, PreludeCellTypeIds } from "./GrammarLanguage"

import { treeNotationTypes } from "../worldWideTypes/treeNotationTypes"

class UnknownGrammarProgram extends TreeNode {
  private _inferRootNodeForAPrefixLanguage(grammarName: string): TreeNode {
    grammarName = GrammarProgram.makeNodeTypeId(grammarName)
    const rootNode = new TreeNode(`${grammarName}
 ${GrammarConstants.root}`)

    // note: right now we assume 1 global cellTypeMap and nodeTypeMap per grammar. But we may have scopes in the future?
    const rootNodeNames = this.getFirstWords().map(word => GrammarProgram.makeNodeTypeId(word))
    rootNode
      .nodeAt(0)
      .touchNode(GrammarConstants.inScope)
      .setWordsFrom(1, Array.from(new Set(rootNodeNames)))

    return rootNode
  }

  private _renameIntegerKeywords(clone: UnknownGrammarProgram) {
    // todo: why are we doing this?
    for (let node of clone.getTopDownArrayIterator()) {
      const firstWordIsAnInteger = !!node.getFirstWord().match(/^\d+$/)
      const parentFirstWord = node.getParent().getFirstWord()
      if (firstWordIsAnInteger && parentFirstWord) node.setFirstWord(GrammarProgram.makeNodeTypeId(parentFirstWord + "Child"))
    }
  }

  private _getKeywordMaps(clone: UnknownGrammarProgram) {
    const keywordsToChildKeywords: { [firstWord: string]: treeNotationTypes.stringMap } = {}
    const keywordsToNodeInstances: { [firstWord: string]: TreeNode[] } = {}
    for (let node of clone.getTopDownArrayIterator()) {
      const firstWord = node.getFirstWord()
      if (!keywordsToChildKeywords[firstWord]) keywordsToChildKeywords[firstWord] = {}
      if (!keywordsToNodeInstances[firstWord]) keywordsToNodeInstances[firstWord] = []
      keywordsToNodeInstances[firstWord].push(node)
      node.forEach((child: TreeNode) => {
        keywordsToChildKeywords[firstWord][child.getFirstWord()] = true
      })
    }
    return { keywordsToChildKeywords: keywordsToChildKeywords, keywordsToNodeInstances: keywordsToNodeInstances }
  }

  private _inferNodeTypeDef(firstWord: string, globalCellTypeMap: Map<string, string>, childFirstWords: string[], instances: TreeNode[]) {
    const xi = this.getXI()
    const nodeTypeId = GrammarProgram.makeNodeTypeId(firstWord)
    const nodeDefNode = <TreeNode>new TreeNode(nodeTypeId).nodeAt(0)
    const childNodeTypeIds = childFirstWords.map(word => GrammarProgram.makeNodeTypeId(word))
    if (childNodeTypeIds.length) nodeDefNode.touchNode(GrammarConstants.inScope).setWordsFrom(1, childNodeTypeIds)

    const cellsForAllInstances = instances
      .map(line => line.getContent())
      .filter(line => line)
      .map(line => line.split(xi))
    const instanceCellCounts = new Set(cellsForAllInstances.map(cells => cells.length))
    const maxCellsOnLine = Math.max(...Array.from(instanceCellCounts))
    const minCellsOnLine = Math.min(...Array.from(instanceCellCounts))
    let catchAllCellType: string
    let cellTypeIds = []
    for (let cellIndex = 0; cellIndex < maxCellsOnLine; cellIndex++) {
      const cellType = this._getBestCellType(firstWord, instances.length, maxCellsOnLine, cellsForAllInstances.map(cells => cells[cellIndex]))
      if (!globalCellTypeMap.has(cellType.cellTypeId)) globalCellTypeMap.set(cellType.cellTypeId, cellType.cellTypeDefinition)

      cellTypeIds.push(cellType.cellTypeId)
    }
    if (maxCellsOnLine > minCellsOnLine) {
      //columns = columns.slice(0, min)
      catchAllCellType = cellTypeIds.pop()
      while (cellTypeIds[cellTypeIds.length - 1] === catchAllCellType) {
        cellTypeIds.pop()
      }
    }

    const needsMatchProperty = TreeUtils._replaceNonAlphaNumericCharactersWithCharCodes(firstWord) !== firstWord

    if (needsMatchProperty) nodeDefNode.set(GrammarConstants.match, firstWord)

    if (catchAllCellType) nodeDefNode.set(GrammarConstants.catchAllCellType, catchAllCellType)

    if (cellTypeIds.length > 0) nodeDefNode.set(GrammarConstants.cells, cellTypeIds.join(xi))

    //if (!catchAllCellType && cellTypeIds.length === 1) nodeDefNode.set(GrammarConstants.cells, cellTypeIds[0])

    // Todo: add conditional frequencies
    return nodeDefNode.getParent().toString()
  }

  inferGrammarFileForAPrefixLanguage(grammarName: string): string {
    const clone = <UnknownGrammarProgram>this.clone()
    this._renameIntegerKeywords(clone)

    const { keywordsToChildKeywords, keywordsToNodeInstances } = this._getKeywordMaps(clone)

    const globalCellTypeMap = new Map()
    globalCellTypeMap.set(PreludeCellTypeIds.anyCell, undefined)
    const nodeTypeDefs = Object.keys(keywordsToChildKeywords).map(firstWord =>
      this._inferNodeTypeDef(firstWord, globalCellTypeMap, Object.keys(keywordsToChildKeywords[firstWord]), keywordsToNodeInstances[firstWord])
    )

    const cellTypeDefs: string[] = []
    globalCellTypeMap.forEach((def, id) => cellTypeDefs.push(def ? def : id))
    const yi = this.getYI()
    return [this._inferRootNodeForAPrefixLanguage(grammarName).toString(), cellTypeDefs.join(yi), nodeTypeDefs.join(yi)].filter(def => def).join("\n")
  }

  private _getBestCellType(
    firstWord: string,
    instanceCount: treeNotationTypes.int,
    maxCellsOnLine: treeNotationTypes.int,
    allValues: any[]
  ): { cellTypeId: string; cellTypeDefinition?: string } {
    const asSet = new Set(allValues)
    const xi = this.getXI()
    const values = Array.from(asSet).filter(c => c)
    const every = (fn: Function) => {
      for (let index = 0; index < values.length; index++) {
        if (!fn(values[index])) return false
      }
      return true
    }
    if (every((str: string) => str === "0" || str === "1")) return { cellTypeId: PreludeCellTypeIds.bitCell }

    if (
      every((str: string) => {
        const num = parseInt(str)
        if (isNaN(num)) return false
        return num.toString() === str
      })
    ) {
      return { cellTypeId: PreludeCellTypeIds.intCell }
    }

    if (every((str: string) => str.match(/^-?\d*.?\d+$/))) return { cellTypeId: PreludeCellTypeIds.floatCell }

    const bools = new Set(["1", "0", "true", "false", "t", "f", "yes", "no"])
    if (every((str: string) => bools.has(str.toLowerCase()))) return { cellTypeId: PreludeCellTypeIds.boolCell }

    // todo: cleanup
    const enumLimit = 30
    if (instanceCount > 1 && maxCellsOnLine === 1 && allValues.length > asSet.size && asSet.size < enumLimit)
      return {
        cellTypeId: GrammarProgram.makeCellTypeId(firstWord),
        cellTypeDefinition: `${GrammarProgram.makeCellTypeId(firstWord)}
 enum ${values.join(xi)}`
      }

    return { cellTypeId: PreludeCellTypeIds.anyCell }
  }
}

export { UnknownGrammarProgram }
