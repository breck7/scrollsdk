#! /usr/local/bin/node --use_strict

const Hakon = require("./Hakon.js")

const testTree = {}

testTree.all = equal => {
  // Arrange
  const program = new Hakon.Program(`body
 color red`)

  // Act/Assert
  equal(program.getProgramErrors().length, 0)
}

/*NODE_JS_ONLY*/ if (!module.parent) require("../../tests/testTreeRunner.js")(testTree)
module.exports = testTree
