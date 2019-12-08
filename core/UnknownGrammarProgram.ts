import { TreeNode } from "./TreeNode"
import { TreeUtils } from "./TreeUtils"

import { GrammarConstants, HandGrammarProgram, PreludeCellTypeIds } from "./GrammarLanguage"

import { treeNotationTypes } from "../products/treeNotationTypes"

class UnknownGrammarProgram extends TreeNode {
  private _inferRootNodeForAPrefixLanguage(grammarName: string): TreeNode {
    grammarName = HandGrammarProgram.makeNodeTypeId(grammarName)
    const rootNode = new TreeNode(`${grammarName}
 ${GrammarConstants.root}`)

    // note: right now we assume 1 global cellTypeMap and nodeTypeMap per grammar. But we may have scopes in the future?
    const rootNodeNames = this.getFirstWords()
      .filter(identity => identity)
      .map(word => HandGrammarProgram.makeNodeTypeId(word))
    rootNode
      .nodeAt(0)
      .touchNode(GrammarConstants.inScope)
      .setWordsFrom(1, Array.from(new Set(rootNodeNames)))

    return rootNode
  }

  private static _childSuffix = "Child"

  private _renameIntegerKeywords(clone: UnknownGrammarProgram) {
    // todo: why are we doing this?
    for (let node of clone.getTopDownArrayIterator()) {
      const firstWordIsAnInteger = !!node.getFirstWord().match(/^\d+$/)
      const parentFirstWord = node.getParent().getFirstWord()
      if (firstWordIsAnInteger && parentFirstWord) node.setFirstWord(HandGrammarProgram.makeNodeTypeId(parentFirstWord + UnknownGrammarProgram._childSuffix))
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
    const edgeSymbol = this.getEdgeSymbol()
    const nodeTypeId = HandGrammarProgram.makeNodeTypeId(firstWord)
    const nodeDefNode = <TreeNode>new TreeNode(nodeTypeId).nodeAt(0)
    const childNodeTypeIds = childFirstWords.map(word => HandGrammarProgram.makeNodeTypeId(word))
    if (childNodeTypeIds.length) nodeDefNode.touchNode(GrammarConstants.inScope).setWordsFrom(1, childNodeTypeIds)

    const cellsForAllInstances = instances
      .map(line => line.getContent())
      .filter(identity => identity)
      .map(line => line.split(edgeSymbol))
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

    const needsCruxProperty = !firstWord.endsWith(UnknownGrammarProgram._childSuffix + "Node") // todo: cleanup
    if (needsCruxProperty) nodeDefNode.set(GrammarConstants.crux, firstWord)

    if (catchAllCellType) nodeDefNode.set(GrammarConstants.catchAllCellType, catchAllCellType)

    const cellLine = cellTypeIds.slice()
    cellLine.unshift(PreludeCellTypeIds.keywordCell)
    if (cellLine.length > 0) nodeDefNode.set(GrammarConstants.cells, cellLine.join(edgeSymbol))

    //if (!catchAllCellType && cellTypeIds.length === 1) nodeDefNode.set(GrammarConstants.cells, cellTypeIds[0])

    // Todo: add conditional frequencies
    return nodeDefNode.getParent().toString()
  }

  //  inferGrammarFileForAnSSVLanguage(grammarName: string): string {
  //     grammarName = HandGrammarProgram.makeNodeTypeId(grammarName)
  //    const rootNode = new TreeNode(`${grammarName}
  // ${GrammarConstants.root}`)

  //    // note: right now we assume 1 global cellTypeMap and nodeTypeMap per grammar. But we may have scopes in the future?
  //    const rootNodeNames = this.getFirstWords().map(word => HandGrammarProgram.makeNodeTypeId(word))
  //    rootNode
  //      .nodeAt(0)
  //      .touchNode(GrammarConstants.inScope)
  //      .setWordsFrom(1, Array.from(new Set(rootNodeNames)))

  //    return rootNode
  //  }

  inferGrammarFileForAKeywordLanguage(grammarName: string): string {
    const clone = <UnknownGrammarProgram>this.clone()
    this._renameIntegerKeywords(clone)

    const { keywordsToChildKeywords, keywordsToNodeInstances } = this._getKeywordMaps(clone)

    const globalCellTypeMap = new Map()
    globalCellTypeMap.set(PreludeCellTypeIds.keywordCell, undefined)
    const nodeTypeDefs = Object.keys(keywordsToChildKeywords)
      .filter(identity => identity)
      .map(firstWord => this._inferNodeTypeDef(firstWord, globalCellTypeMap, Object.keys(keywordsToChildKeywords[firstWord]), keywordsToNodeInstances[firstWord]))

    const cellTypeDefs: string[] = []
    globalCellTypeMap.forEach((def, id) => cellTypeDefs.push(def ? def : id))
    const nodeBreakSymbol = this.getNodeBreakSymbol()

    return this._formatCode([this._inferRootNodeForAPrefixLanguage(grammarName).toString(), cellTypeDefs.join(nodeBreakSymbol), nodeTypeDefs.join(nodeBreakSymbol)].filter(identity => identity).join("\n"))
  }

  private _formatCode(code: string) {
    // todo: make this run in browser too
    if (!this.isNodeJs()) return code

    const grammarProgram = new HandGrammarProgram(TreeNode.fromDisk(__dirname + "/../langs/grammar/grammar.grammar"))
    const programConstructor = <any>grammarProgram.compileAndReturnRootConstructor()
    const program = new programConstructor(code)
    return program.format().toString()
  }

  private _getBestCellType(firstWord: string, instanceCount: treeNotationTypes.int, maxCellsOnLine: treeNotationTypes.int, allValues: any[]): { cellTypeId: string; cellTypeDefinition?: string } {
    const asSet = new Set(allValues)
    const edgeSymbol = this.getEdgeSymbol()
    const values = Array.from(asSet).filter(identity => identity)
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
        cellTypeId: HandGrammarProgram.makeCellTypeId(firstWord),
        cellTypeDefinition: `${HandGrammarProgram.makeCellTypeId(firstWord)}
 enum ${values.join(edgeSymbol)}`
      }

    return { cellTypeId: PreludeCellTypeIds.anyCell }
  }
}

export { UnknownGrammarProgram }
