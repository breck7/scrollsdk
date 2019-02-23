const TreeNode = require("../base/TreeNode.js")
const TreeUtils = require("../base/TreeUtils.js")

const GrammarConstants = require("./GrammarConstants.js")
const GrammarConstantsNode = require("./GrammarConstantsNode.js")
const AbstractGrammarDefinitionNode = require("./AbstractGrammarDefinitionNode.js")

class GrammarKeywordDefinitionNode extends AbstractGrammarDefinitionNode {
  _getRunTimeCatchAllKeyword() {
    return this.get(GrammarConstants.catchAllKeyword) || this.getParent()._getRunTimeCatchAllKeyword()
  }

  _isOrExtendsAKeywordInScope(keywordsInScope) {
    const chain = this._getKeywordChain()
    return keywordsInScope.some(keyword => chain[keyword])
  }

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

  _getKeywordsNode() {
    return this.getNode(GrammarConstants.keywords)
  }

  _getProgramKeywordDefinitionCache() {
    return this.getParent()._getProgramKeywordDefinitionCache()
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
    return constantsNode ? constantsNode.getConstantsObj() : {}
  }

  getFrequency() {
    const val = this.get(GrammarConstants.frequency)
    return val ? parseFloat(val) : 0
  }
}

module.exports = GrammarKeywordDefinitionNode
