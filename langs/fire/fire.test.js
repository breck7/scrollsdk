#! /usr/local/bin/node --use_strict

const FireProgram = require("./Fire.js")

const testTree = {}

testTree.all = equal => {
  // Arrange
  const program = new FireProgram(`add ten 2 3 5`)

  // Act/Assert
  equal(program.getProgramErrors().length, 0)
  equal(program.compile(), `const ten = [2, 3, 5].reduce((sum, num) => sum + num)`)
}

/*NODE_JS_ONLY*/ if (!module.parent) require("../../tests/testTreeRunner.js")(testTree)
module.exports = testTree
