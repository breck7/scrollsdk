const DynamicNode = require("./DynamicNode.js")

class TreeErrorNode extends DynamicNode {
  getWordTypeLine() {
    return "error ".repeat(this.getWords().length).trim()
  }

  getErrors() {
    return [`Unknown keyword "${this.getKeyword()}" at line ${this.getPoint().y}`]
  }
}

module.exports = TreeErrorNode
