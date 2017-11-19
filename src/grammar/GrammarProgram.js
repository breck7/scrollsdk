const TreeNode = require("../base/TreeNode.js")

const AbstractGrammarBackedProgram = require("./AbstractGrammarBackedProgram.js")
const GrammarConstants = require("./GrammarConstants.js")
const AbstractGrammarDefinitionNode = require("./AbstractGrammarDefinitionNode.js")
const GrammarKeywordDefinitionNode = require("./GrammarKeywordDefinitionNode.js")
const GrammarRootNode = require("./GrammarRootNode.js")
const GrammarWordTypeNode = require("./GrammarWordTypeNode.js")

class GrammarProgram extends AbstractGrammarDefinitionNode {
  getKeywordMap() {
    const map = {}
    map[GrammarConstants.grammar] = GrammarRootNode
    map[GrammarConstants.wordType] = GrammarWordTypeNode
    map[GrammarConstants.keyword] = GrammarKeywordDefinitionNode
    return map
  }

  getTargetExtension() {
    return this._getGrammarRootNode().getTargetExtension()
  }

  getWordTypes() {
    if (!this._cache_wordTypes) this._cache_wordTypes = this._getWordTypes()
    return this._cache_wordTypes
  }

  _getWordTypes() {
    const types = {}
    this.getChildrenByNodeType(GrammarWordTypeNode).forEach(type => (types[type.getId()] = type))
    return types
  }

  getProgram() {
    return this
  }

  getKeywordDefinitions() {
    return this.getChildrenByNodeType(GrammarKeywordDefinitionNode)
  }

  // todo: remove?
  getTheGrammarFilePath() {
    return this.getLine()
  }

  _getGrammarRootNode() {
    return this.getNodeByType(GrammarRootNode)
  }

  getExtensionName() {
    return this._getGrammarRootNode().getId()
  }

  _getKeywordsNode() {
    return this._getGrammarRootNode().getNode(GrammarConstants.keywords)
  }

  getDefinitionByKeywordPath(keywordPath) {
    const parts = keywordPath.split(" ")
    let subject = this
    let def
    while (parts.length) {
      const part = parts.shift()
      def = subject.getRunTimeKeywordMapWithDefinitions()[part]
      if (!def) def = subject._getCatchAllDefinition()
      subject = def
    }
    return def
  }

  getDocs() {
    return this.toString()
  }

  _initDefinitionCache() {
    if (this._cache_definitions) return undefined
    const definitionMap = {}

    this.getChildrenByNodeType(GrammarKeywordDefinitionNode).forEach(definitionNode => {
      definitionMap[definitionNode.getId()] = definitionNode
    })

    this._cache_definitions = definitionMap
  }

  _getDefinitionCache() {
    this._initDefinitionCache()
    return this._cache_definitions
  }

  _getDefinitions() {
    return Object.values(this._getDefinitionCache())
  }

  _getRunTimeCatchAllKeyword() {
    return this._getGrammarRootNode().findBeam(GrammarConstants.catchAllKeyword)
  }

  _getRootParserClass() {
    const definedClass = this._getGrammarRootNode().getParserClass()
    const extendedClass = definedClass || AbstractGrammarBackedProgram
    const grammarProgram = this
    return class extends extendedClass {
      getGrammarProgram() {
        return grammarProgram
      }
    }
  }

  getRootParserClass() {
    if (!this._cache_rootParserClass) this._cache_rootParserClass = this._getRootParserClass()
    return this._cache_rootParserClass
  }

  toSublimeSyntaxFile() {
    // todo.
    return `%YAML 1.2
---
name: ${this.getExtensionName()}
file_extensions: [${this.getExtensionName()}]
scope: source.${this.getExtensionName()}

contexts:
 main:
   - match: (\A|^) *[^ ]+
     scope: storage.type.tree
     set: [parameters]

 parameters:
   - match: $
     scope: entity.name.type.tree
     pop: true`
  }

  static newFromCondensed(grammarCode, grammarPath) {
    // todo: handle imports
    const tree = new TreeNode(grammarCode)

    const expandedGrammarCode = tree.getExpanded(1, 2)
    return new GrammarProgram(expandedGrammarCode, grammarPath)
  }
}

module.exports = GrammarProgram
