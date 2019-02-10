const GrammarBackedNonTerminalNode = require("./GrammarBackedNonTerminalNode.js")

class GrammarBackedAnyNode extends GrammarBackedNonTerminalNode {
  getKeywordMap() {
    return {}
  }

  getErrors() {
    return []
  }

  getCatchAllNodeClass(line) {
    return GrammarBackedAnyNode
  }
}

module.exports = GrammarBackedAnyNode
