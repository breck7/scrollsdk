const TestBlock = require("./TestBlock.js")

class SkippedTestBlock extends TestBlock {
  async execute() {
    console.log(`Skipped test ${this.getLine()}`)
  }
}

module.exports = SkippedTestBlock
