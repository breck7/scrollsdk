import GrammarBackedNonTerminalNode from "./GrammarBackedNonTerminalNode"
import types from "../types"

class GrammarBackedAnyNode extends GrammarBackedNonTerminalNode {
  getKeywordMap() {
    return {}
  }

  getErrors(): types.ParseError[] {
    return []
  }

  getCatchAllNodeConstructor(line: string) {
    return GrammarBackedAnyNode
  }
}

export default GrammarBackedAnyNode
