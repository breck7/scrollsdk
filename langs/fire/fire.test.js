#! /usr/local/bin/node --use_strict

const fire = require("./fire.js")

const testTree = {}

testTree.all = equal => {
  // Arrange
  const program = new fire(`add ten 2 3 5`)

  // Act/Assert
  equal(program.getAllErrors().length, 0, "no errors")
  equal(program.compile(), `const ten = [2, 3, 5].reduce((sum, num) => sum + num)`)
}

/*NODE_JS_ONLY*/ if (!module.parent) require("../../tests/testTreeRunner.js")(testTree)
module.exports = testTree
