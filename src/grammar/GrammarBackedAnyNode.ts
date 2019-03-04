import GrammarBackedNonTerminalNode from "./GrammarBackedNonTerminalNode"

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

export default GrammarBackedAnyNode
