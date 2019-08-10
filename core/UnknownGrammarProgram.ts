//tooling product jtree.node.js
//tooling product jtree.browser.js

import TreeNode from "./TreeNode"
import TreeUtils from "./TreeUtils"

import { GrammarConstants, GrammarProgram, PreludeCellTypeIds } from "./GrammarLanguage"

import jTreeTypes from "./jTreeTypes"

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
    const keywordsToChildKeywords: { [firstWord: string]: jTreeTypes.stringMap } = {}
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

    const cells = instances
      .map(line => line.getContent())
      .filter(line => line)
      .map(line => line.split(xi))
    const sizes = new Set(cells.map(c => c.length))
    const max = Math.max(...Array.from(sizes))
    const min = Math.min(...Array.from(sizes))
    let catchAllCellType: string
    let cellTypes = []
    for (let index = 0; index < max; index++) {
      const cellType = this._getBestCellType(firstWord, cells.map(c => c[index]))
      if (!globalCellTypeMap.has(cellType.cellTypeId)) globalCellTypeMap.set(cellType.cellTypeId, cellType.cellTypeDefinition)

      cellTypes.push(cellType.cellTypeId)
    }
    if (max > min) {
      //columns = columns.slice(0, min)
      catchAllCellType = cellTypes.pop()
      while (cellTypes[cellTypes.length - 1] === catchAllCellType) {
        cellTypes.pop()
      }
    }

    const needsMatchProperty = TreeUtils._replaceNonAlphaNumericCharactersWithCharCodes(firstWord) !== firstWord

    if (needsMatchProperty) nodeDefNode.set(GrammarConstants.match, firstWord)

    if (catchAllCellType) nodeDefNode.set(GrammarConstants.catchAllCellType, catchAllCellType)

    if (cellTypes.length > 1) nodeDefNode.set(GrammarConstants.cells, cellTypes.join(xi))

    if (!catchAllCellType && cellTypes.length === 1) nodeDefNode.set(GrammarConstants.cells, cellTypes[0])

    // Todo: add conditional frequencies
    return nodeDefNode.getParent().toString()
  }

  inferGrammarFileForAPrefixLanguage(grammarName: string): string {
    const clone = <UnknownGrammarProgram>this.clone()
    this._renameIntegerKeywords(clone)

    const { keywordsToChildKeywords, keywordsToNodeInstances } = this._getKeywordMaps(clone)

    const globalCellTypeMap = new Map()
    const nodeTypeDefs = Object.keys(keywordsToChildKeywords).map(firstWord =>
      this._inferNodeTypeDef(firstWord, globalCellTypeMap, Object.keys(keywordsToChildKeywords[firstWord]), keywordsToNodeInstances[firstWord])
    )

    const cellTypeDefs: string[] = []
    globalCellTypeMap.forEach((def, id) => cellTypeDefs.push(def ? def : id))
    const yi = this.getYI()
    return [this._inferRootNodeForAPrefixLanguage(grammarName).toString(), cellTypeDefs.join(yi), nodeTypeDefs.join(yi)].filter(def => def).join("\n")
  }

  private _getBestCellType(firstWord: string, allValues: any[]): { cellTypeId: string; cellTypeDefinition?: string } {
    const asSet = new Set(allValues)
    const xi = this.getXI()
    const values = Array.from(asSet).filter(c => c)
    const all = (fn: Function) => {
      for (let i = 0; i < values.length; i++) {
        if (!fn(values[i])) return false
      }
      return true
    }
    if (all((str: string) => str === "0" || str === "1")) return { cellTypeId: PreludeCellTypeIds.bitCell }

    if (
      all((str: string) => {
        const num = parseInt(str)
        if (isNaN(num)) return false
        return num.toString() === str
      })
    ) {
      return { cellTypeId: PreludeCellTypeIds.intCell }
    }

    if (all((str: string) => !str.match(/[^\d\.\-]/))) return { cellTypeId: PreludeCellTypeIds.floatCell }

    const bools = new Set(["1", "0", "true", "false", "t", "f", "yes", "no"])
    if (all((str: string) => bools.has(str.toLowerCase()))) return { cellTypeId: PreludeCellTypeIds.boolCell }

    // If there are duplicate files and the set is less than enum
    const enumLimit = 10
    if ((asSet.size === 1 || allValues.length > asSet.size) && asSet.size < enumLimit)
      return {
        cellTypeId: GrammarProgram.makeCellTypeId(firstWord),
        cellTypeDefinition: `${GrammarProgram.makeCellTypeId(firstWord)}
 enum ${values.join(xi)}`
      }

    return { cellTypeId: PreludeCellTypeIds.anyCell }
  }
}

export { UnknownGrammarProgram }
