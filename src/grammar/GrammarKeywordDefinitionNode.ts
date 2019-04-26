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
    const program = this.getProgram()
    const escapeRegExp = str => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    const color = (this.getHighlightScope() || "source") + "." + this.getId()
    const match = `'^ *${escapeRegExp(this.getId())}(?: |$)'`
    const topHalf = ` '${this.getSyntaxContextId()}':
  - match: ${match}
    scope: ${color}`
    const cols = this.getNodeColumnTypes()
    if (!cols.length) return topHalf
    const captures = cols
      .map((col, index) => {
        const wordType = program.getWordType(col) // todo: cleanup
        if (!wordType) throw new Error(`No column type ${col} found`) // todo: standardize error/capture error at grammar time
        return `        ${index + 1}: ${(wordType.getHighlightScope() || "source") + "." + wordType.getId()}`
      })
      .join("\n")

    const colsToRegex = cols => {
      return cols.map(col => `({{${col.replace("*", "")}}})?`).join(" ?")
    }

    return `${topHalf}
    push:
     - match: ${colsToRegex(cols)}
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

  protected _initKeywordInheritanceSetCache() {
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

  protected _getDefaultsNode() {
    return this.get(GrammarConstants.defaults)
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
    return this.getChildrenByNodeType(GrammarExampleNode)
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
