const TreeProgram = require("../treeprogram.js")
const Tape = require("tape")

class UnitTestSection extends TreeProgram {}

class WallProgram extends TreeProgram {
  parseNodeType(line) {
    return UnitTestSection
  }

  getSectionsToRun() {
    const onlyRun = this.getChildren().filter(node => node.getLine().startsWith("+"))
    return onlyRun.length ? onlyRun : this.getChildren().filter(node => !node.getLine().startsWith("!"))
  }

  execute(testFn) {
    this.getSectionsToRun().map(child => {
      Tape(child.getBase(), assert => {
        const results = testFn(child)
        assert.equal(results.actual, results.expected, results.message)
        assert.end()
      })
    })
  }
}

module.exports = WallProgram
