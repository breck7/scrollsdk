import AbstractRuntimeNonRootNode from "./AbstractRuntimeNonRootNode"
import { GrammarConstants } from "./GrammarConstants"
import { UnknownNodeTypeError } from "./TreeErrorTypes"
import jTreeTypes from "../jTreeTypes"

class GrammarBackedErrorNode extends AbstractRuntimeNonRootNode {
  getLineCellTypes() {
    return "error ".repeat(this.getWords().length).trim()
  }

  getErrors(): UnknownNodeTypeError[] {
    return [new UnknownNodeTypeError(this)]
  }
}

export default GrammarBackedErrorNode
