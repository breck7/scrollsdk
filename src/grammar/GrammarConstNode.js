const TreeNode = require("../base/TreeNode.js")

class GrammarConstNode extends TreeNode {
  getValue() {
    // todo: parse type
    if (this.length) return this.childrenToString()
    return this.getWords(2).join(" ")
  }
  getName() {
    return this.getKeyword()
  }
}

module.exports = GrammarConstNode
