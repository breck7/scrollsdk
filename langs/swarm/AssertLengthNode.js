const AbstractAssertNode = require("./AbstractAssertNode.js")

class AssertLengthNode extends AbstractAssertNode {
  parseActual(actual) {
    return actual.length
  }

  printFailureMessage(actual) {
    super.printFailureMessage()
    console.log(actual.join("\n"))
  }
}

module.exports = AssertLengthNode
