const TreeNode = require("../TreeNode.js")
const TreeUtils = require("../TreeUtils.js")
const GrammarConstants = require("./GrammarConstants.js")
const GrammarCompilerNode = require("./GrammarCompilerNode.js")

class AbstractGrammarDefinitionNode extends TreeNode {
  getProgram() {
    return this.getParent()
  }

  getDefinitionCompilerNode(targetLanguage, node) {
    const compilerNode = this._getCompilerNodes().find(node => node.getTargetExtension() === targetLanguage)
    if (!compilerNode) throw new Error(`No compiler for language "${targetLanguage}" for line "${node.getLine()}"`)
    return compilerNode
  }

  _getCompilerNodes() {
    return this.getChildrenByNodeType(GrammarCompilerNode) || []
  }

  // todo: remove?
  // for now by convention first compiler is "target extension"
  getTargetExtension() {
    const firstNode = this._getCompilerNodes()[0]
    return firstNode ? firstNode.getTargetExtension() : ""
  }

  getRunTimeKeywordMap() {
    this._initKeywordsMapCache()
    return this._cache_keywordsMap
  }

  getRunTimeKeywordNames() {
    return Object.keys(this.getRunTimeKeywordMap())
  }

  getRunTimeKeywordMapWithDefinitions() {
    const defs = this._getDefinitionCache()
    return TreeUtils.mapValues(this.getRunTimeKeywordMap(), key => defs[key])
  }

  getBeamParameters() {
    const parameters = this.findBeam(GrammarConstants.columns)
    return parameters ? parameters.split(" ") : []
  }

  _initKeywordsMapCache() {
    if (this._cache_keywordsMap) return undefined
    // todo: make this handle extensions.
    const allDefs = this._getDefinitionCache()
    const keywordMap = {}
    this._cache_keywordsMap = keywordMap
    const acceptableKeywords = this.getAllowableKeywords()
    // terminals dont have acceptable keywords
    if (!Object.keys(acceptableKeywords).length) return undefined
    const matching = Object.keys(allDefs).filter(key => allDefs[key].isAKeyword(acceptableKeywords))

    matching.forEach(key => {
      keywordMap[key] = allDefs[key].getParserClass()
    })
  }

  getAllowableKeywords() {
    const keywords = this._getKeyWordsNode()
    return keywords ? keywords.toObject() : {}
  }

  getTopNodeTypes() {
    const definitions = this._getDefinitionCache()
    const keywords = this.getRunTimeKeywordMap()
    const arr = Object.keys(keywords).map(keyword => definitions[keyword])
    arr.sort(AbstractGrammarDefinitionNode.sortByAccessor(definition => definition.getFrequency()))
    arr.reverse()
    return arr.map(definition => definition.getKeyword())
  }

  getDefinitionByName(keyword) {
    const definitions = this._getDefinitionCache()
    return definitions[keyword] || this._getCatchAllDefinition() // todo: this is where we might do some type of keyword lookup for user defined fns.
  }

  _getCatchAllDefinition() {
    const catchAllKeyword = this._getRunTimeCatchAllKeyword()
    const definitions = this._getDefinitionCache()
    const def = definitions[catchAllKeyword]
    // todo: implement contraints like a grammar file MUST have a catch all.
    return def ? def : this.getParent()._getCatchAllDefinition()
  }

  _initCatchCallNodeCache() {
    if (this._cache_catchAll) return undefined

    this._cache_catchAll = this._getCatchAllDefinition().getParserClass()
  }

  getAutocompleteWords(inputStr, additionalWords = []) {
    // todo: add more tests
    const str = this.getRunTimeKeywordNames()
      .concat(additionalWords)
      .join("\n")

    // default is to just autocomplete using all words in existing program.
    return TreeUtils.getUniqueWordsArray(str)
      .filter(obj => obj.word.includes(inputStr) && obj.word !== inputStr)
      .map(obj => obj.word)
  }

  isDefined(keyword) {
    return !!this._getDefinitionCache()[keyword.toLowerCase()]
  }

  getRunTimeCatchAllNodeClass() {
    this._initCatchCallNodeCache()
    return this._cache_catchAll
  }
}

module.exports = AbstractGrammarDefinitionNode
