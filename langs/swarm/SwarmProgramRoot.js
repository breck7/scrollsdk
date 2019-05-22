const fs = require("fs")
const jtree = require("../../index.js")

const TestSetupNode = require("./TestSetupNode.js")
const TestBlock = require("./TestBlock.js")
const SkippedTestBlock = require("./SkippedTestBlock.js")
const SoloTestBlock = require("./SoloTestBlock.js")

class SwarmProgramRoot extends jtree.programRoot {
  getCommandParent(testSubject) {
    return testSubject
  }

  getTestSetupNode() {
    return this.getChildrenByNodeConstructor(TestSetupNode)[0]
  }

  execute(filepath) {
    const tests = this.getTestsToRun()
    tests.map(test => test.execute(filepath))
    return `${tests.length} tests started.`
  }

  getTestsToRun() {
    const solos = this.getChildrenByNodeConstructor(SoloTestBlock)
    const testsToRun = solos.length ? solos : this.getChildrenByNodeConstructor(TestBlock).filter(test => !(test instanceof SkippedTestBlock))
    return testsToRun
  }
}

module.exports = SwarmProgramRoot
