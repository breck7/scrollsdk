#! /usr/bin/env node

const hakon = require("./hakon.js")

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
/*NODE_JS_ONLY*/ if (!module.parent) require("../../products/jtree.node.js").Utils.runTestTree(testTree)
module.exports = testTree
