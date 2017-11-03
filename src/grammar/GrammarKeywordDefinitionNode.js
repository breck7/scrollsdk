const TreeNode = require("../TreeNode.js")
const TreeUtils = require("../TreeUtils.js")

const GrammarConstants = require("./GrammarConstants.js")
const GrammarDefinitionErrorNode = require("./GrammarDefinitionErrorNode.js")
const GrammarConstantsNode = require("./GrammarConstantsNode.js")
const GrammarCompilerNode = require("./GrammarCompilerNode.js")
const GrammarParserClassNode = require("./GrammarParserClassNode.js")
const AbstractGrammarDefinitionNode = require("./AbstractGrammarDefinitionNode.js")

const TreeNonTerminalNode = require("../TreeNonTerminalNode.js")
const TreeTerminalNode = require("../TreeTerminalNode.js")
const TreeErrorNode = require("../TreeErrorNode.js")

class GrammarKeywordDefinitionNode extends AbstractGrammarDefinitionNode {
  getKeywordMap() {
    const types = [
      GrammarConstants.frequency,
      GrammarConstants.keywords,
      GrammarConstants.columns,
      GrammarConstants.description,
      GrammarConstants.catchAllKeyword,
      GrammarConstants.defaults,
      GrammarConstants.ohayoSvg,
      GrammarConstants.ohayoTileSize,
      GrammarConstants.ohayoTileClass,
      GrammarConstants.ohayoTileScript,
      GrammarConstants.ohayoTileCssScript
    ]
    const map = {}
    types.forEach(type => {
      map[type] = TreeNode
    })
    map[GrammarConstants.constants] = GrammarConstantsNode
    map[GrammarConstants.compilerKeyword] = GrammarCompilerNode
    map[GrammarConstants.parser] = GrammarParserClassNode
    return map
  }

  getCatchAllNodeClass(line) {
    return GrammarDefinitionErrorNode
  }

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

  isNonTerminal() {
    return this.has(GrammarConstants.keywords)
  }

  _getNodeClasses() {
    const builtIns = {
      ErrorNode: TreeErrorNode,
      TerminalNode: TreeTerminalNode,
      NonTerminalNode: TreeNonTerminalNode
    }

    Object.assign(builtIns, this.getProgram().getRootNodeClasses())
    return builtIns
  }

  getParserClass() {
    this._initParserClassCache()
    return this._cache_parserClass
  }

  // todo: cleanup
  _initParserClassCache() {
    if (this._cache_parserClass) return undefined
    // todo: refactor to better way to get js one
    const parserNode = this.findNodes(GrammarConstants.parser).find(node => node.getWord(1) === "js")
    const filepath = parserNode ? parserNode.getParserClassFilePath() : undefined

    const builtIns = this._getNodeClasses()

    if (builtIns[filepath]) this._cache_parserClass = builtIns[filepath]
    else if (!filepath) this._cache_parserClass = this.isNonTerminal() ? TreeNonTerminalNode : TreeTerminalNode
    else {
      // todo: remove "window" below?
      const basePath = TreeUtils.getPathWithoutFileName(this.getRootNode().getFilePath()) + "/"
      const fullPath = filepath.startsWith("/") ? filepath : basePath + filepath
      this._cache_parserClass = this.isNodeJs()
        ? require(fullPath)
        : window[TreeUtils.getClassNameFromFilePath(filepath)]
    }
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
    const constantsNode = this.getNode(GrammarConstants.constants)
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
