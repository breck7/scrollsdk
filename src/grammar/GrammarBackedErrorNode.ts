import AbstractRuntimeNonRootNode from "./AbstractRuntimeNonRootNode"
import { GrammarConstants } from "./GrammarConstants"
import jTreeTypes from "../jTreeTypes"

class GrammarBackedErrorNode extends AbstractRuntimeNonRootNode {
  getLineCellTypes() {
    return "error ".repeat(this.getWords().length).trim()
  }

  getErrors(): jTreeTypes.ParseError[] {
    const parent = this.getParent()
    const context = parent.isRoot() ? "" : parent.getFirstWord()
    const locationMsg = context ? `in "${context}" ` : ""
    const point = this.getPoint()
    const firstWord = this.getFirstWord()
    return [
      {
        kind: jTreeTypes.GrammarConstantsErrors.invalidNodeTypeError,
        subkind: firstWord,
        context: context,
        level: point.x,
        message: `${jTreeTypes.GrammarConstantsErrors.invalidNodeTypeError} "${firstWord}" ${locationMsg}at line ${point.y} column ${point.x}`
      }
    ]
  }
}

export default GrammarBackedErrorNode
