const fs = require("fs")
const jtree = require("../../index.js")

const TestSetupNode = require("./TestSetupNode.js")
const TestBlock = require("./TestBlock.js")
const SkippedTestBlock = require("./SkippedTestBlock.js")
const SoloTestBlock = require("./SoloTestBlock.js")

class SwarmProgram extends jtree.program {
  getCommandParent(testDummy) {
    return testDummy
  }

  getTestSetupNode() {
    return this.getChildrenByNodeType(TestSetupNode)[0]
  }

  execute(filepath) {
    const tests = this.getTestsToRun()
    tests.map(test => test.execute(filepath))
    return `${tests.length} tests started.`
  }

  getTestsToRun() {
    const solos = this.getChildrenByNodeType(SoloTestBlock)
    const testsToRun = solos.length
      ? solos
      : this.getChildrenByNodeType(TestBlock).filter(test => !(test instanceof SkippedTestBlock))
    return testsToRun
  }
}

module.exports = SwarmProgram
