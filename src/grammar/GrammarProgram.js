const TreeNode = require("../TreeNode.js")

const GrammarConstants = require("./GrammarConstants.js")
const AbstractGrammarDefinitionNode = require("./AbstractGrammarDefinitionNode.js")
const GrammarKeywordDefinitionNode = require("./GrammarKeywordDefinitionNode.js")

class GrammarRootNode extends AbstractGrammarDefinitionNode {
  parseNodeType() {
    return TreeNode
  }
}

class GrammarProgram extends AbstractGrammarDefinitionNode {
  parseNodeType(line) {
    // for now, first node will be root node.
    if (this.length === 0) return GrammarRootNode
    return GrammarKeywordDefinitionNode
  }

  _getGrammarRootNode() {
    return this.nodeAt(0) // todo: fragile?
  }

  // todo: remove?
  getTargetExtension() {
    return this._getGrammarRootNode().findBeam(GrammarConstants.targetExtension)
  }

  getExtensionName() {
    return this._getGrammarRootNode().getKeyword()
  }

  _getKeyWordsNode() {
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
      definitionMap[definitionNode.getKeyword()] = definitionNode
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
}

module.exports = GrammarProgram
