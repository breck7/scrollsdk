import TreeNode from "../base/TreeNode"
import TreeUtils from "../base/TreeUtils"

import { GrammarConstants } from "./GrammarConstants"
import GrammarConstantsNode from "./GrammarConstantsNode"
import AbstractGrammarDefinitionNode from "./AbstractGrammarDefinitionNode"

/*FOR_TYPES_ONLY*/ import GrammarProgram from "./GrammarProgram"

class GrammarKeywordDefinitionNode extends AbstractGrammarDefinitionNode {
  // todo: protected?
  _getRunTimeCatchAllKeyword(): string {
    return (
      this.get(GrammarConstants.catchAllKeyword) ||
      (<AbstractGrammarDefinitionNode>this.getParent())._getRunTimeCatchAllKeyword()
    )
  }

  isOrExtendsAKeywordInScope(keywordsInScope: string[]): boolean {
    const chain = this._getKeywordChain()
    return keywordsInScope.some(keyword => chain[keyword])
  }

  _getHighlightScope() {
    return this.get(GrammarConstants.highlightScope)
  }

  getSyntaxContextId() {
    return this.getId().replace(/\#/g, "HASH") // # is not allowed in sublime context names
  }

  getProgram() {
    return <GrammarProgram>this.getParent()
  }

  getMatchBlock() {
    const program = this.getProgram()
    const escapeRegExp = str => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    const color = (this._getHighlightScope() || "source") + "." + this.getId()
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

  private _cache_keywordChain

  protected _getKeywordChain() {
    this._initKeywordChainCache()
    return this._cache_keywordChain
  }

  protected _getParentKeyword() {
    return this.getWord(2)
  }

  protected _initKeywordChainCache() {
    if (this._cache_keywordChain) return undefined
    const cache = {}
    cache[this.getId()] = true
    const parentKeyword = this._getParentKeyword()
    if (parentKeyword) {
      cache[parentKeyword] = true
      const defs = this._getProgramKeywordDefinitionCache()
      const parentDef = defs[parentKeyword]
      if (!parentDef) throw new Error(`${parentKeyword} not found`)
      Object.assign(cache, parentDef._getKeywordChain())
    }
    this._cache_keywordChain = cache
  }

  // todo: protected?
  _getProgramKeywordDefinitionCache() {
    return (<AbstractGrammarDefinitionNode>this.getParent())._getProgramKeywordDefinitionCache()
  }

  getDoc() {
    return this.getId()
  }

  protected _getDefaultsNode() {
    return this.get(GrammarConstants.defaults)
  }

  getDefaultFor(name) {
    const defaults = this._getDefaultsNode()
    return defaults ? defaults.get(name) : undefined
  }

  getDescription() {
    return this.get(GrammarConstants.description) || ""
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
