#! /usr/bin/env node

const path = require("path")
const tql = require("../../products/tql.nodejs.js")
const { TestRacer } = require("../../products/TestRacer.js")
const { TreeBaseFolder } = require("../../products/treeBase.node.js")

const baseFolder = path.join(__dirname, "..", "..", "treeBase", "planets")
const folder = new TreeBaseFolder()
  .setDir(baseFolder)
  .setGrammarDir(baseFolder)
  .loadFolder()

const testTree = {}

testTree.all = equal => {
  // Arrange
  const program = new tql(`has mars
hasNo zzzzz
matches \\d+
where moons = 1
where diameter > 10000
where related has mars
notMissing diameter`)

  // Act/Assert
  equal(program.filterFolder(folder).length, 1)
}

/*NODE_JS_ONLY*/ if (!module.parent) TestRacer.testSingleFile(__filename, testTree)
module.exports = { testTree }
