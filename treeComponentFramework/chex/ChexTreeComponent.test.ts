#!/usr/bin/env ts-node

const { ChexTreeComponent } = require("./ChexTreeComponent")

const testTree: any = {}

testTree.chexBasics = (equal: any) => {
  const app = new ChexTreeComponent()
  equal(!!app, true)
}

/*NODE_JS_ONLY*/ if (!module.parent) require("../../products/jtree.node.js").Utils.runTestTree(testTree)
module.exports = testTree
