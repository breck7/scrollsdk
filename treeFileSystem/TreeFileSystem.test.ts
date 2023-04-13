#!/usr/bin/env ts-node

const { TreeFileSystem } = require("../products/TreeFileSystem.js")
const { TestRacer } = require("../products/TestRacer.js")
import { treeNotationTypes } from "../products/treeNotationTypes"

const testTree: treeNotationTypes.testTree = {}

testTree.disk = equal => {
  // Arrange/Act/Assert
  equal(!!new TreeFileSystem(), true)
}

testTree.inMemory = equal => {
  // Arrange/Act/Assert
  const files = { "/hello": "world", "/main": "import hello\nimport nested/test", "/nested/test": "ciao" }
  const tfs = new TreeFileSystem(files)
  equal(tfs.evaluateImports("/main").afterImportPass, "world\nciao")
}

/*NODE_JS_ONLY*/ if (!module.parent) TestRacer.testSingleFile(__filename, testTree)

export { testTree }
