import TreeNode from "../base/TreeNode"
import { GrammarConstants } from "./GrammarConstants"
import jTreeTypes from "../jTreeTypes"

class GrammarDefinitionErrorNode extends TreeNode {
  getErrors(): jTreeTypes.ParseError[] {
    const parent = this.getParent()
    const context = parent.isRoot() ? "" : parent.getFirstWord()
    const point = this.getPoint()
    return [
      {
        kind: jTreeTypes.GrammarConstantsErrors.invalidNodeTypeError,
        subkind: this.getFirstWord(),
        level: point.x,
        context: context,
        message: `${jTreeTypes.GrammarConstantsErrors.invalidNodeTypeError} "${this.getFirstWord()}" at line ${point.y}`
      }
    ]
  }

  getLineCellTypes() {
    return [<string>GrammarConstants.nodeType].concat(this.getWordsFrom(1).map(word => "any")).join(" ")
  }
}

export default GrammarDefinitionErrorNode
