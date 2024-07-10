#!/usr/bin/env ts-node

const { TreeFileSystem } = require("../products/TreeFileSystem.js")
const { TestRacer } = require("../products/TestRacer.js")
const path = require("path")
import { scrollNotationTypes } from "../products/scrollNotationTypes"

const testTree: scrollNotationTypes.testTree = {}

testTree.disk = equal => {
  const tfs = new TreeFileSystem()
  // Arrange/Act/Assert
  equal(tfs.assembleFile(path.join(__dirname, "..", "readme.scroll")).afterImportPass.length > 0, true)
}

testTree.inMemory = equal => {
  // Arrange/Act/Assert
  const files = {
    "/hello": "world",
    "/main": "import hello\nimport nested/test",
    "/nested/test": "ciao",
    "/nested/deep/relative": "import ../../hello\nimport ../test"
  }
  const tfs = new TreeFileSystem(files)
  equal(tfs.dirname("/"), "/")
  equal(tfs.assembleFile("/main").afterImportPass, "world\nciao")
  equal(tfs.assembleFile("/nested/deep/relative").afterImportPass, "world\nciao")
}

/*NODE_JS_ONLY*/ if (!module.parent) TestRacer.testSingleFile(__filename, testTree)

export { testTree }
