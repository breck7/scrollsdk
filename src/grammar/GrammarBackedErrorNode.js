const GrammarBackedNode = require("./GrammarBackedNode.js")

class GrammarBackedErrorNode extends GrammarBackedNode {
  getLineSyntax() {
    return "error ".repeat(this.getWords().length).trim()
  }

  getErrors() {
    return [
      `unknownKeywordError "${this.getKeyword()}" in "${this.getParent().getKeyword()}" at line ${this.getPoint().y}`
    ]
  }
}

module.exports = GrammarBackedErrorNode
