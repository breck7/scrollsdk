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
    return Promise.all(this.getTestsToRun().map(test => test.execute(filepath)))
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
