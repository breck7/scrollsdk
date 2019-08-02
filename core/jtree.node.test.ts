#!/usr/bin/env ts-node

import jtree from "./jtree.node"
import jTreeTypes from "./jTreeTypes"
import { TestTreeRunner } from "../builder/TestTreeRunner"

const TreeNode = jtree.TreeNode
const fs = require("fs")

const testTree: jTreeTypes.testTree = {}

testTree.combineTests = equal => {
  // Arrange
  const combined = jtree.combineFiles([__dirname + "/*.swarm"])

  // Act/Assert
  equal(combined.toString().includes("constructWithBlockString"), true, "Included something from a swarm file")
}

testTree.diskTests = equal => {
  // Arrange
  const path = __dirname + `/temp-disk.csv`

  // Assert
  equal(fs.existsSync(path), false, "file does not exist")

  // Arrange
  const node = TreeNode.fromCsv(TreeNode.iris)
  node.toDisk(path)

  // Act/Assert
  equal(fs.existsSync(path), true, "file exists")
  equal(TreeNode.fromDisk(path).toString(), node.toString(), "tree unchanged")

  // Cleanup
  fs.unlinkSync(path)

  // Assert
  equal(fs.existsSync(path), false, "file does not exist")
}

/*NODE_JS_ONLY*/ if (!module.parent) new TestTreeRunner().run(testTree)

export { testTree }
