import { AbstractRuntimeNonRootNode } from "./AbstractRuntimeNodes"
import { GrammarConstants } from "./GrammarConstants"
import { UnknownNodeTypeError, BlankLineError } from "./TreeErrorTypes"
import jTreeTypes from "../jTreeTypes"

class GrammarBackedErrorNode extends AbstractRuntimeNonRootNode {
  getLineCellTypes() {
    return "error ".repeat(this.getWords().length).trim()
  }

  getErrors(): UnknownNodeTypeError[] {
    return [this.getFirstWord() ? new UnknownNodeTypeError(this) : new BlankLineError(this)]
  }
}

export default GrammarBackedErrorNode
