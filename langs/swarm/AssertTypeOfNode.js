const AbstractAssertNode = require("./AbstractAssertNode.js")

class AssertTypeOfNode extends AbstractAssertNode {
  parseActual(actual) {
    return typeof actual
  }
}

module.exports = AssertTypeOfNode
