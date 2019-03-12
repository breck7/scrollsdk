const AbstractAssertNode = require("./AbstractAssertNode.js")

class AssertIncludesNode extends AbstractAssertNode {
  getTestResult(actualAsString, expected, message) {
    const result = actualAsString.includes(expected)
    this.equal(result, true, message)
    return result
  }
}

module.exports = AssertIncludesNode
