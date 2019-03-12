const AbstractAssertNode = require("./AbstractAssertNode.js")

class AssertEqualBlockNode extends AbstractAssertNode {
  getExpected() {
    return this.childrenToString()
  }

  getSyncExpected() {
    return this.childrenToString()
  }
}

module.exports = AssertEqualBlockNode
