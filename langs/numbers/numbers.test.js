#! /usr/bin/env node

const numbers = require("../../products/numbers.nodejs.js")
const { jtree } = require("../../index.js")

const testTree = {}

testTree.all = equal => {
  // Arrange
  const program = new numbers(`+ 2 2 1 2
- 2 2`)

  // Act/Assert
  equal(program.getAllErrors().length, 0)
  equal(program.execute().join(" "), `7 0`)

  // A/A/A
  equal(new numbers(`+ 2 2 1 1`).execute().join(""), `6`)
}

/*NODE_JS_ONLY*/ if (!module.parent) jtree.TestRacer.testSingleFile(__filename, testTree)
module.exports = { testTree }
