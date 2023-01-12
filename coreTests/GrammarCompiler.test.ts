#!/usr/bin/env ts-node

import { treeNotationTypes } from "../products/treeNotationTypes"

const { TreeNode } = require("../products/TreeNode.js")
const { Disk } = require("../products/Disk.node.js")
const { Utils } = require("../products/Utils.js")
const { TestRacer } = require("../products/TestRacer.node.js")
const { GrammarCompiler } = require("../products/GrammarCompiler.js")

const testTree: treeNotationTypes.testTree = {}

testTree.compileGrammarAndCreateProgram = equal => {
  // Arrange
  const jibberishRootDir = __dirname + "/../langs/jibberish/"
  const programPath = jibberishRootDir + "sample.jibberish"
  const grammarPath = jibberishRootDir + "jibberish.grammar"

  // Act
  const program = GrammarCompiler.compileGrammarAndCreateProgram(programPath, grammarPath)
  const result = program.execute()

  // Assert
  equal(program.constructor.name, "jibberishNode", "parent program class parsed correctly")
  equal(result, 42)
}

testTree.combineTests = equal => {
  // Arrange
  const combined = GrammarCompiler.combineFiles([__dirname + "/*.swarm"])

  // Act/Assert
  equal(combined.toString().includes("constructWithParagraph"), true, "Included something from a swarm file")
}

testTree.diskTests = equal => {
  // Arrange
  const path = __dirname + `/temp-disk.csv`

  // Assert
  equal(Disk.exists(path), false, "file does not exist")

  // Arrange
  const node = TreeNode.fromCsv(TreeNode.iris)
  node.toDisk(path)

  // Act/Assert
  equal(Disk.exists(path), true, "file exists")
  equal(TreeNode.fromDisk(path).toString(), node.toString(), "tree unchanged")

  // Cleanup
  Disk.rm(path)

  // Assert
  equal(Disk.exists(path), false, "file does not exist")
}

testTree.findProjectRoot = equal => {
  const dir = Utils.findProjectRoot(__dirname, "jtree")
  equal(typeof dir, "string")
  equal(dir.includes("coreTests"), false, "correct parent dir selected")

  try {
    const result = Utils.findProjectRoot("/foo/bar/", "jtree")
    equal(result, false, "error should have been thrown")
  } catch (err) {
    equal(true, true, "error thrown")
  }

  try {
    Utils.findProjectRoot(__dirname + "/../", "fakeproject")
    equal(true, false, "error should have been thrown")
  } catch (err) {
    equal(true, true, "error thrown")
  }
}

/*NODE_JS_ONLY*/ if (!module.parent) TestRacer.testSingleFile(__filename, testTree)

export { testTree }
