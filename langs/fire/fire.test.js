#! /usr/bin/env node

const fire = require("../../products/fire.nodejs.js")
const { TestRacer } = require("../../products/TestRacer.js")

const testTree = {}

testTree.all = equal => {
  // Arrange
  const program = new fire(`add ten 2 3 5`)

  // Act/Assert
  equal(program.getAllErrors().length, 0, "no errors")
  equal(program.compile(), `const ten = 2 + 3 + 5`)
}

/*NODE_JS_ONLY*/ if (!module.parent) TestRacer.testSingleFile(__filename, testTree)
module.exports = { testTree }
