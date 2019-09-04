#! /usr/bin/env node

const hakon = require("./hakon.node.js")

const testTree = {}

testTree.all = equal => {
  // Arrange
  const program = new hakon(`body
 color red`)

  // Act/Assert
  equal(program.getAllErrors().length, 0)
  equal(
    program.compile(),
    `body {
  color: red;
}
`
  )
}
/*NODE_JS_ONLY*/ if (!module.parent) require("../../index.js").jtree.Utils.runTestTree(testTree)
module.exports = testTree
