#! /usr/bin/env node

const ChexTreeComponent = require("./ChexTreeComponent.js")

const testTree = {}

testTree.basics = equal => {
  const app = new ChexTreeComponent()
  equal(!!app, true)
}

/*NODE_JS_ONLY*/ if (!module.parent) require("../../builder/testTreeRunner.js")(testTree)
module.exports = testTree
