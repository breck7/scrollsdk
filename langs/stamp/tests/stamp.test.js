#! /usr/bin/env node

const stamp = require("../../../products/stamp.nodejs.js")
const fs = require("fs")
const { jtree } = require("../../../index.js")

const testTree = {}

testTree.toStamp = equal => {
  // Arrange/Act/Assert
  const expected = `file cases/executable.stamp
file cases/test.stamp`
  equal(stamp.dirToStamp(__dirname + "/cases"), expected, "correct")
}

testTree.executeStamp = equal => {
  // Arrange
  const name = "testFile.okToDelete.txt"
  equal(fs.existsSync(name), false)

  // Act
  new stamp(`file ${name}`).silence().execute()

  // Assert
  equal(fs.existsSync(name), true)

  // Cleanup
  fs.unlinkSync(name)
  equal(fs.existsSync(name), false)
}

testTree.stampTargetDifferentDir = equal => {
  // Arrange
  const newDir = "some-new-dir"
  const filename = "testFile.okToDelete.txt"
  const targetDir = __dirname + "/temp"
  const fullPath = `${targetDir}/${newDir}/${filename}`
  equal(fs.existsSync(fullPath), false)

  // Act
  new stamp(`file ${newDir}/${filename}`).silence().execute(targetDir)

  // Assert
  equal(fs.existsSync(fullPath), true)

  // Cleanup
  fs.unlinkSync(fullPath)
  fs.rmdirSync(`${targetDir}/${newDir}`)
  fs.rmdirSync(targetDir)
  equal(fs.existsSync(targetDir), false)
}

/*NODE_JS_ONLY*/ if (!module.parent) jtree.TestRacer.testSingleFile(__filename, testTree)
module.exports = { testTree }
