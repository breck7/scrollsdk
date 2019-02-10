const GrammarBackedNode = require("./GrammarBackedNode.js")

class GrammarBackedErrorNode extends GrammarBackedNode {
  getLineSyntax() {
    return "error ".repeat(this.getWords().length).trim()
  }

  getErrors() {
    const parent = this.getParent()
    const locationMsg = parent.isRoot() ? "" : `in "${parent.getKeyword()}" `
    const point = this.getPoint()
    return [`unknownKeywordError "${this.getKeyword()}" ${locationMsg}at line ${point.y} column ${point.x}`]
  }
}

module.exports = GrammarBackedErrorNode
