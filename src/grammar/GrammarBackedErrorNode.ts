import AbstractRuntimeCodeNode from "./AbstractRuntimeCodeNode"
import { GrammarConstants, GrammarConstantsErrors } from "./GrammarConstants"
import types from "../types"

class GrammarBackedErrorNode extends AbstractRuntimeCodeNode {
  getLineSyntax() {
    return "error ".repeat(this.getWords().length).trim()
  }

  getErrors(): types.ParseError[] {
    const parent = this.getParent()
    const context = parent.isRoot() ? "" : parent.getKeyword()
    const locationMsg = context ? `in "${context}" ` : ""
    const point = this.getPoint()
    const keyword = this.getKeyword()
    return [
      {
        kind: GrammarConstantsErrors.invalidKeywordError,
        subkind: keyword,
        context: context,
        level: point.x,
        message: `${GrammarConstantsErrors.invalidKeywordError} "${keyword}" ${locationMsg}at line ${point.y} column ${
          point.x
        }`
      }
    ]
  }
}

export default GrammarBackedErrorNode
