import TreeNode from "../base/TreeNode"
import TreeUtils from "../base/TreeUtils"

import { GrammarConstants } from "./GrammarConstants"
import GrammarConstantsNode from "./GrammarConstantsNode"
import GrammarExampleNode from "./GrammarExampleNode"
import AbstractGrammarDefinitionNode from "./AbstractGrammarDefinitionNode"

/*FOR_TYPES_ONLY*/ import GrammarProgram from "./GrammarProgram"

import types from "../types"

class GrammarKeywordDefinitionNode extends AbstractGrammarDefinitionNode {
  // todo: protected?
  _getRunTimeCatchAllKeyword(): string {
    return (
      this.get(GrammarConstants.catchAllKeyword) ||
      (<AbstractGrammarDefinitionNode>this.getParent())._getRunTimeCatchAllKeyword()
    )
  }

  isOrExtendsAKeywordInScope(keywordsInScope: string[]): boolean {
    const chain = this.getKeywordInheritanceSet()
    return keywordsInScope.some(keyword => chain.has(keyword))
  }

  getSyntaxContextId() {
    return this.getId().replace(/\#/g, "HASH") // # is not allowed in sublime context names
  }

  getMatchBlock() {
    const defaultHighlightScope = "source"
    const program = this.getProgram()
    const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    const color = (this.getHighlightScope() || defaultHighlightScope) + "." + this.getId()
    const match = `'^ *${escapeRegExp(this.getId())}(?: |$)'`
    const topHalf = ` '${this.getSyntaxContextId()}':
  - match: ${match}
    scope: ${color}`
    const requiredCellTypeNames = this.getRequiredCellTypeNames()
    const catchAllCellTypeName = this.getCatchAllCellTypeName()
    if (catchAllCellTypeName) requiredCellTypeNames.push(catchAllCellTypeName)
    if (!requiredCellTypeNames.length) return topHalf
    const captures = requiredCellTypeNames
      .map((typeName, index) => {
        const cellTypeDefinition = program.getCellTypeDefinition(typeName) // todo: cleanup
        if (!cellTypeDefinition) throw new Error(`No ${GrammarConstants.cellType} ${typeName} found`) // todo: standardize error/capture error at grammar time
        return `        ${index + 1}: ${(cellTypeDefinition.getHighlightScope() || defaultHighlightScope) +
          "." +
          cellTypeDefinition.getCellTypeId()}`
      })
      .join("\n")

    const cellTypesToRegex = (cellTypeNames: string[]) =>
      cellTypeNames.map((cellTypeName: string) => `({{${cellTypeName}}})?`).join(" ?")

    return `${topHalf}
    push:
     - match: ${cellTypesToRegex(requiredCellTypeNames)}
       captures:
${captures}
     - match: $
       pop: true`
  }

  private _cache_keywordInheritanceSet: Set<types.word>

  getKeywordInheritanceSet() {
    this._initKeywordInheritanceSetCache()
    return this._cache_keywordInheritanceSet
  }

  protected _getParentKeyword() {
    return this.getWord(2)
  }

  protected _initKeywordInheritanceSetCache(): void {
    if (this._cache_keywordInheritanceSet) return undefined
    const cache = new Set()
    cache.add(this.getId())
    const parentKeyword = this._getParentKeyword()
    if (parentKeyword) {
      cache.add(parentKeyword)
      const defs = this._getProgramKeywordDefinitionCache()
      const parentDef = defs[parentKeyword]
      if (!parentDef) throw new Error(`${parentKeyword} not found`)

      for (let keyword of parentDef.getKeywordInheritanceSet()) {
        cache.add(keyword)
      }
    }
    this._cache_keywordInheritanceSet = cache
  }

  // todo: protected?
  _getProgramKeywordDefinitionCache() {
    return this.getProgram()._getProgramKeywordDefinitionCache()
  }

  getDoc() {
    return this.getId()
  }

  private _getDefaultsNode() {
    return this.getNode(GrammarConstants.defaults)
  }

  // todo: deprecate?
  getDefaultFor(name: string) {
    const defaults = this._getDefaultsNode()
    return defaults ? defaults.get(name) : undefined
  }

  getDescription(): string {
    return this.get(GrammarConstants.description) || ""
  }

  getExamples(): GrammarExampleNode[] {
    return this.getChildrenByNodeConstructor(GrammarExampleNode)
  }

  getConstantsObject() {
    const constantsNode = this.getNodeByType(GrammarConstantsNode)
    return constantsNode ? (<GrammarConstantsNode>constantsNode).getConstantsObj() : {}
  }

  getFrequency() {
    const val = this.get(GrammarConstants.frequency)
    return val ? parseFloat(val) : 0
  }
}

export default GrammarKeywordDefinitionNode
