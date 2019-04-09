import TreeNode from "../base/TreeNode"
import { GrammarConstants, GrammarConstantsErrors } from "./GrammarConstants"
import types from "../types"

class GrammarDefinitionErrorNode extends TreeNode {
  getErrors(): types.ParseError[] {
    const parent = this.getParent()
    const context = parent.isRoot() ? "" : parent.getKeyword()
    const point = this.getPoint()
    return [
      {
        kind: GrammarConstantsErrors.invalidKeywordError,
        subkind: this.getKeyword(),
        level: point.x,
        context: context,
        message: `${GrammarConstantsErrors.invalidKeywordError} "${this.getKeyword()}" at line ${point.y}`
      }
    ]
  }

  getLineSyntax() {
    return ["keyword"].concat(this.getWordsFrom(1).map(word => "any")).join(" ")
  }
}

export default GrammarDefinitionErrorNode
