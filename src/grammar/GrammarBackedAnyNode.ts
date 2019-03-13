import GrammarBackedNonTerminalNode from "./GrammarBackedNonTerminalNode"

class GrammarBackedAnyNode extends GrammarBackedNonTerminalNode {
  getKeywordMap() {
    return {}
  }

  getErrors() {
    return []
  }

  getCatchAllNodeConstructor(line) {
    return GrammarBackedAnyNode
  }
}

export default GrammarBackedAnyNode
