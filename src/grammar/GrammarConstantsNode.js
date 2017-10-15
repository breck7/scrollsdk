const TreeNode = require("../TreeNode.js")

const GrammarConstNode = require("./GrammarConstNode.js")

class GrammarConstantsNode extends TreeNode {
  getCatchAllNodeClass(line) {
    return GrammarConstNode
  }

  getConstantsObj() {
    const result = {}
    this.getChildren().forEach(node => {
      const name = node.getName()
      result[name] = node.getValue()
    })
    return result
  }
}

module.exports = GrammarConstantsNode
