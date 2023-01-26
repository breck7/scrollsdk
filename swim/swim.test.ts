#!/usr/bin/env ts-node

import { treeNotationTypes } from "../products/treeNotationTypes"

const { TreeNode } = require("../products/TreeNode.js")
const { TestRacer } = require("../products/TestRacer.js")

const testTree: treeNotationTypes.testTree = {}

testTree.runSwimTests = equal => {
  // Arrange/Act/Assert
  const tests = TreeNode.fromDisk(__dirname + "/TreeNode.swim")
  tests.forEach((test: any) => {
    const arrange = test.getNode("arrange").childrenToString() // Note: used in the eval below
    const expected = test.getNode("assert").childrenToString()
    const code = test.getNode("act").childrenToString()
    equal(eval(code), expected, test.getLine())
  })
}

/*NODE_JS_ONLY*/ if (!module.parent) TestRacer.testSingleFile(__filename, testTree)

export { testTree }
