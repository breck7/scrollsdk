import TreeNode from "../base/TreeNode"
import { GrammarConstants, GrammarConstantsErrors } from "./GrammarConstants"
import types from "../types"

class GrammarDefinitionErrorNode extends TreeNode {
  getErrors(): types.ParseError[] {
    const parent = this.getParent()
    const context = parent.isRoot() ? "" : parent.getFirstWord()
    const point = this.getPoint()
    return [
      {
        kind: GrammarConstantsErrors.invalidNodeTypeError,
        subkind: this.getFirstWord(),
        level: point.x,
        context: context,
        message: `${GrammarConstantsErrors.invalidNodeTypeError} "${this.getFirstWord()}" at line ${point.y}`
      }
    ]
  }

  getLineSyntax() {
    return [<string>GrammarConstants.nodeType].concat(this.getWordsFrom(1).map(word => "any")).join(" ")
  }
}

export default GrammarDefinitionErrorNode
