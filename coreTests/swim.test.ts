#!/usr/bin/env ts-node

const { jtree } = require("../index.js")
import { treeNotationTypes } from "../products/treeNotationTypes"

const { TreeNode } = jtree // Note: used in the eval below

const testTree: treeNotationTypes.testTree = {}

testTree.runSwimTests = equal => {
  // Arrange/Act/Assert
  const tests = jtree.TreeNode.fromDisk(__dirname + "/core.swim")
  tests.forEach((test: any) => {
    const arrange = test.getNode("arrange").childrenToString() // Note: used in the eval below
    const expected = test.getNode("assert").childrenToString()
    const code = test.getNode("act").childrenToString()
    equal(eval(code), expected, test.getLine())
  })
}

/*NODE_JS_ONLY*/ if (!module.parent) jtree.TestRacer.testSingleFile(__filename, testTree)

export { testTree }
