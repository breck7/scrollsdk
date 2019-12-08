#! /usr/bin/env node

const stamp = require("../../../products/stamp.nodejs.js")
const { jtree } = require("../../../index.js")

const testTree = {}

testTree.all = equal => {
  // Arrange/Act/Assert
  const expected = `file cases/executable.stamp
file cases/test.stamp`
  equal(stamp.dirToStamp(__dirname + "/cases"), expected, "correct")
}

/*NODE_JS_ONLY*/ if (!module.parent) jtree.TestRacer.testSingleFile(__filename, testTree)
module.exports = { testTree }
