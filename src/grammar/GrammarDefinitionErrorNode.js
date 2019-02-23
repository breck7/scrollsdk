const TreeNode = require("../base/TreeNode.js")
const GrammarConstants = require("./GrammarConstants.js")

class GrammarDefinitionErrorNode extends TreeNode {
  getErrors() {
    const parent = this.getParent()
    const context = parent.isRoot() ? "" : parent.getKeyword()
    const point = this.getPoint()
    return [
      {
        kind: GrammarConstants.invalidKeywordError,
        subkind: this.getKeyword(),
        level: point.x,
        context: context,
        message: `${GrammarConstants.invalidKeywordError} "${this.getKeyword()}" at line ${point.y}`
      }
    ]
  }

  getLineSyntax() {
    return ["keyword"].concat(this.getWordsFrom(1).map(word => "any")).join(" ")
  }
}

module.exports = GrammarDefinitionErrorNode
