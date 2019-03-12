const jtree = require("../../index.js")

class AbstractAssertNode extends jtree.NonTerminalNode {
  async execute(dummy) {
    const finalParts = AbstractAssertNode._getMethodFromDotPath(dummy, this.getWord(1))
    const subject = finalParts[0]
    const command = finalParts[1]
    const actual = subject[command]()
    const actualAsString = this.parseActual(actual).toString()
    const expected = this.getExpected()
    const isPassed = this.getTestResult(actualAsString, expected, this.getLine())
    if (!isPassed) {
      this.printFailureMessage(actual)
      debugger
    }
  }

  printFailureMessage() {
    const line = this.getLine()
    this.setLine(`FAILED:${line}`)
    this.setLine(line)
    console.log(this.getStackString())
    const lineNumber = this.getPoint()
    console.log(`Line number ${lineNumber.y}`)
  }

  equal(actual, expected, message) {
    this.getParent().getEqualFn()(actual, expected, message)
  }

  getTestResult(actualAsString, expected, message) {
    this.equal(actualAsString, expected, message)
    return actualAsString === expected
  }

  parseActual(actual) {
    return actual
  }

  async executeSync(result) {
    const expected = this.getSyncExpected()
    const actual = this.parseActual(result)
    const actualIsUndefined = actual === undefined
    const actualAsString = actualIsUndefined ? "undefined" : actual.toString()
    const isPassed = this.getTestResult(actualAsString, expected, this.getLine())
    if (!isPassed) {
      this.printFailureMessage(result)
      debugger
    }
  }

  getExpected() {
    return this.getWordsFrom(2).join(" ")
  }

  getSyncExpected() {
    return this.getContent()
  }

  static _getMethodFromDotPath(context, str) {
    const methodParts = str.split(".")
    while (methodParts.length > 1) {
      context = context[methodParts.shift()]()
    }
    const final = methodParts.shift()
    return [context, final]
  }
}

module.exports = AbstractAssertNode
