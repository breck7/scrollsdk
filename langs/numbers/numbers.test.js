#! /usr/bin/env node

const numbers = require("./numbers.js")

const testTree = {}

testTree.all = equal => {
  // Arrange
  const program = new numbers(`+ 2 2 1 2
- 2 2`)

  // Act/Assert
  equal(program.getAllErrors().length, 0)
  equal(program.executeSync().join(" "), `7 0`)

  // A/A/A
  equal(new numbers(`+ 2 2 1 1`).executeSync().join(""), `6`)
}

/*NODE_JS_ONLY*/ if (!module.parent) require("../../builder/testTreeRunner.js")(testTree)
module.exports = testTree
