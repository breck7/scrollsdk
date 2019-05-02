#! /usr/local/bin/node --use_strict

// todo: make isomorphic

const TreeTools = require("../index.js")

const testTree = {}

testTree.version = equal => {
  // Arrange/Act/Assert
  equal(!!TreeTools.getVersion(), true)
}

/*NODE_JS_ONLY*/ if (!module.parent) require("./testTreeRunner.js")(testTree)
module.exports = testTree
