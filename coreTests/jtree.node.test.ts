#!/usr/bin/env ts-node

const { jtree } = require("../index.js")
import { treeNotationTypes } from "../products/treeNotationTypes"

const TreeNode = jtree.TreeNode

const { Disk } = require("../products/Disk.node.js")

const testTree: treeNotationTypes.testTree = {}

testTree.combineTests = equal => {
  // Arrange
  const combined = jtree.combineFiles([__dirname + "/*.swarm"])

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
  const dir = jtree.Utils.findProjectRoot(__dirname, "jtree")
  equal(typeof dir, "string")
  equal(dir.includes("coreTests"), false, "correct parent dir selected")

  try {
    const result = jtree.Utils.findProjectRoot("/foo/bar/", "jtree")
    equal(result, false, "error should have been thrown")
  } catch (err) {
    equal(true, true, "error thrown")
  }

  try {
    jtree.Utils.findProjectRoot(__dirname + "/../", "fakeproject")
    equal(true, false, "error should have been thrown")
  } catch (err) {
    equal(true, true, "error thrown")
  }
}

/*NODE_JS_ONLY*/ if (!module.parent) jtree.TestRacer.testSingleFile(__filename, testTree)

export { testTree }
