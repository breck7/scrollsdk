#! /usr/local/bin/node --use_strict

const fs = require("fs")
const jtree = require("../index.js")
const TreeNode = jtree.TreeNode
const Utils = jtree.Utils

const distribute = inputFilePath => {
  const masterFile = new TreeNode(fs.readFileSync(path, "utf8"))
  // TODO: IMPLEMENT!
}

const theSavedFilepath = process.argv[2]
distribute(theSavedFilepath)
