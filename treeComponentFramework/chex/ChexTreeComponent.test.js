#! /usr/bin/env node

const ChexTreeComponent = require("./ChexTreeComponent.js")

const testTree = {}

testTree.chexBasics = equal => {
  const app = new ChexTreeComponent()
  equal(!!app, true)
}

/*NODE_JS_ONLY*/ if (!module.parent) require("../../products/jtree.node.js").Utils.runTestTree(testTree)
module.exports = testTree
