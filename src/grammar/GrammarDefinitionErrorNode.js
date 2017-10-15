const TreeNode = require("../TreeNode.js")

class GrammarDefinitionErrorNode extends TreeNode {
  getErrors() {
    return [`Unknown keyword "${this.getKeyword()}" at line ${this.getPoint().y}`]
  }

  getWordTypeLine() {
    return ["keyword"].concat(this.getWords(1).map(word => "any")).join(" ")
  }
}

module.exports = GrammarDefinitionErrorNode

