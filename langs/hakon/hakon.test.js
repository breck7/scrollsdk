#! /usr/local/bin/node --use_strict

const HakonProgram = require("./HakonProgram.js")

const testTree = {}

testTree.all = equal => {
  // Arrange
  const program = new HakonProgram(`body
 color red`)

  // Act/Assert
  equal(program.getAllErrors().length, 0)
}

/*NODE_JS_ONLY*/ if (!module.parent) require("../../tests/testTreeRunner.js")(testTree)
module.exports = testTree
