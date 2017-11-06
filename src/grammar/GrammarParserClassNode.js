const TreeNode = require("../base/TreeNode.js")

class GrammarParserClassNode extends TreeNode {
  getParserClassFilePath() {
    return this.getWord(2)
  }
}

module.exports = GrammarParserClassNode
