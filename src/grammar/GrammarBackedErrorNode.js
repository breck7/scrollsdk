const GrammarBackedNode = require("./GrammarBackedNode.js")
const GrammarConstants = require("./GrammarConstants.js")

class GrammarBackedErrorNode extends GrammarBackedNode {
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
        kind: GrammarConstants.invalidKeywordError,
        subkind: keyword,
        context: context,
        level: point.x,
        message: `${GrammarConstants.invalidKeywordError} "${keyword}" ${locationMsg}at line ${point.y} column ${
          point.x
        }`
      }
    ]
  }
}

module.exports = GrammarBackedErrorNode
