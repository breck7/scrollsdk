import GrammarBackedNonTerminalNode from "./GrammarBackedNonTerminalNode"
import types from "../types"

class GrammarBackedBlobNode extends GrammarBackedNonTerminalNode {
  getFirstWordMap() {
    return {}
  }

  getErrors(): types.ParseError[] {
    return []
  }

  getCatchAllNodeConstructor(line: string) {
    return GrammarBackedBlobNode
  }
}

export default GrammarBackedBlobNode
