const TreeNode = require("../base/TreeNode.js")

class GrammarDefinitionErrorNode extends TreeNode {
  getErrors() {
    return [`Unknown keyword "${this.getKeyword()}" at line ${this.getPoint().y}`]
  }

  getWordTypeLine() {
    return ["keyword"].concat(this.getWordsFrom(1).map(word => "any")).join(" ")
  }
}

module.exports = GrammarDefinitionErrorNode

