import TreeNode from "../base/TreeNode"
import TreeUtils from "../base/TreeUtils"

import GrammarConstants from "./GrammarConstants"
import GrammarConstantsNode from "./GrammarConstantsNode"
import AbstractGrammarDefinitionNode from "./AbstractGrammarDefinitionNode"

class GrammarKeywordDefinitionNode extends AbstractGrammarDefinitionNode {
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

  private _cache_keywordChain

  _getKeywordChain() {
    this._initKeywordChainCache()
    return this._cache_keywordChain
  }

  _getParentKeyword() {
    return this.getWord(2)
  }

  _initKeywordChainCache() {
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

  _getProgramKeywordDefinitionCache() {
    return (<AbstractGrammarDefinitionNode>this.getParent())._getProgramKeywordDefinitionCache()
  }

  getDoc() {
    return this.getId()
  }

  _getDefaultsNode() {
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
