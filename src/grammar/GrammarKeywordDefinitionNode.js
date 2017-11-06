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

  _initKeywordChainCache() {
    if (this._cache_keywordChain) return undefined
    const cache = {}
    cache[this.getKeyword()] = true
    const beam = this.getBeam()
    if (beam) {
      cache[beam] = true
      const defs = this._getDefinitionCache()
      const parentDef = defs[beam]
      Object.assign(cache, parentDef._getKeywordChain())
    }
    this._cache_keywordChain = cache
  }

  _getKeyWordsNode() {
    return this.getNode(GrammarConstants.keywords)
  }

  _getDefinitionCache() {
    return this.getParent()._getDefinitionCache()
  }

  getDoc() {
    return this.getKeyword()
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

  getAllTileSettingsDefinitions() {
    const allKeywordDefs = this.getRunTimeKeywordMapWithDefinitions()
    return Object.values(allKeywordDefs).filter(def => def.isTileSettingDefinition())
  }

  isTileSettingDefinition() {
    return this.isAKeyword({ setting: true })
  }

  getSvg() {
    return this.findBeam(GrammarConstants.ohayoSvg) || "table"
  }

  getSuggestedSize() {
    const ohayoTileSize = this.findBeam(GrammarConstants.ohayoTileSize) || "280 220"
    const parts = ohayoTileSize.split(" ").map(ohayoTileSize => parseInt(ohayoTileSize))
    return {
      width: parts[0],
      height: parts[1]
    }
  }

  getConstantsObject() {
    const constantsNode = this.getNodeByType(GrammarConstantsNode)
    return constantsNode ? constantsNode.getConstantsObj() : {}
  }

  getFrequency() {
    const val = this.findBeam(GrammarConstants.frequency)
    return val ? parseFloat(val) : 0
  }

  toFormBray(value) {
    return `@input
 data-onChangeCommand tile changeTileSettingAndRenderCommand
 name ${this.getKeyword()}
 value ${value}`
  }
}

module.exports = GrammarKeywordDefinitionNode
