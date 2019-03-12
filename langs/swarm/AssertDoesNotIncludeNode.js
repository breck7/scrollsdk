const AssertIncludesNode = require("./AssertIncludesNode.js")

class AssertDoesNotIncludeNode extends AssertIncludesNode {
  getTestResult(actualAsString, expected, message) {
    const result = !actualAsString.includes(expected)
    if (!result) {
      const index = actualAsString.indexOf(expected)
      const start = Math.max(0, index - 50)
      message += ` Found ${expected} in: ` + actualAsString.substr(start, index + 50 + expected.length)
    }
    this.equal(result, true, message)
    return result
  }
}

module.exports = AssertDoesNotIncludeNode
