import AbstractRuntimeNonRootNode from "./AbstractRuntimeNonRootNode"
import { GrammarConstants, GrammarConstantsErrors } from "./GrammarConstants"
import types from "../types"

class GrammarBackedErrorNode extends AbstractRuntimeNonRootNode {
  getLineSyntax() {
    return "error ".repeat(this.getWords().length).trim()
  }

  getErrors(): types.ParseError[] {
    const parent = this.getParent()
    const context = parent.isRoot() ? "" : parent.getFirstWord()
    const locationMsg = context ? `in "${context}" ` : ""
    const point = this.getPoint()
    const firstWord = this.getFirstWord()
    return [
      {
        kind: GrammarConstantsErrors.invalidNodeTypeError,
        subkind: firstWord,
        context: context,
        level: point.x,
        message: `${GrammarConstantsErrors.invalidNodeTypeError} "${firstWord}" ${locationMsg}at line ${
          point.y
        } column ${point.x}`
      }
    ]
  }
}

export default GrammarBackedErrorNode
