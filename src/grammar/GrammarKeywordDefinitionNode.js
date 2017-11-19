const TreeNode = require("../base/TreeNode.js")
const TreeUtils = require("../base/TreeUtils.js")

const GrammarConstants = require("./GrammarConstants.js")
const GrammarConstantsNode = require("./GrammarConstantsNode.js")
const AbstractGrammarDefinitionNode = require("./AbstractGrammarDefinitionNode.js")

class GrammarKeywordDefinitionNode extends AbstractGrammarDefinitionNode {
  _getRunTimeCatchAllKeyword() {
    return this.findBeam(GrammarConstants.catchAllKeyword) || this.getParent()._getRunTimeCatchAllKeyword()
  }

  isAKeyword(keywordsMap) {
    const chain = this._getKeywordChain()
    return Object.keys(keywordsMap).some(keyword => chain[keyword])
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
      const defs = this._getDefinitionCache()
      const parentDef = defs[parentKeyword]
      Object.assign(cache, parentDef._getKeywordChain())
    }
    this._cache_keywordChain = cache
  }

  _getKeywordsNode() {
    return this.getNode(GrammarConstants.keywords)
  }

  _getDefinitionCache() {
    return this.getParent()._getDefinitionCache()
  }

  getDoc() {
    return this.getId()
  }

  _getDefaultsNode() {
    return this.findBeam(GrammarConstants.defaults)
  }

  getDefaultFor(name) {
    const defaults = this._getDefaultsNode()
    return defaults ? defaults.findBeam(name) : undefined
  }

  getDescription() {
    return this.findBeam(GrammarConstants.description) || ""
  }

  // todo: delete
  getAllTileSettingsDefinitions() {
    const allKeywordDefs = this.getRunTimeKeywordMapWithDefinitions()
    return Object.values(allKeywordDefs).filter(def => def.isTileSettingDefinition())
  }

  // todo: delete
  isTileSettingDefinition() {
    return this.isAKeyword({ setting: true })
  }

  // todo: delete
  toFormBray(value) {
    return `@input
 data-onChangeCommand tile changeTileSettingAndRenderCommand
 name ${this.getId()}
 value ${value}`
  }

  getConstantsObject() {
    const constantsNode = this.getNodeByType(GrammarConstantsNode)
    return constantsNode ? constantsNode.getConstantsObj() : {}
  }

  getFrequency() {
    const val = this.findBeam(GrammarConstants.frequency)
    return val ? parseFloat(val) : 0
  }
}

module.exports = GrammarKeywordDefinitionNode
