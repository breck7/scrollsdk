const AbstractGrammarDefinitionNode = require("./AbstractGrammarDefinitionNode.js")

class GrammarRootNode extends AbstractGrammarDefinitionNode {
  _getDefaultParserClass() {}
}

module.exports = GrammarRootNode
