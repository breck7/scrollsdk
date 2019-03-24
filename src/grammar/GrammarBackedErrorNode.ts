import AbstractRuntimeCodeNode from "./AbstractRuntimeCodeNode"
import GrammarConstants from "./GrammarConstants"

class GrammarBackedErrorNode extends AbstractRuntimeCodeNode {
  getLineSyntax() {
    return "error ".repeat(this.getWords().length).trim()
  }

  getErrors() {
    const parent = this.getParent()
    const context = parent.isRoot() ? "" : parent.getKeyword()
    const locationMsg = context ? `in "${context}" ` : ""
    const point = this.getPoint()
    const keyword = this.getKeyword()
    return [
      {
        kind: GrammarConstants.errors.invalidKeywordError,
        subkind: keyword,
        context: context,
        level: point.x,
        message: `${GrammarConstants.errors.invalidKeywordError} "${keyword}" ${locationMsg}at line ${point.y} column ${
          point.x
        }`
      }
    ]
  }
}

export default GrammarBackedErrorNode
