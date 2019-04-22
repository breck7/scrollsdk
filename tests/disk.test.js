#! /usr/local/bin/node --use_strict

const quack = require("./quack.js")
const jtree = require("../index.js")
const TreeNode = jtree.TreeNode
const fs = require("fs")

quack.quickTest("disk tests", equal => {
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
})
