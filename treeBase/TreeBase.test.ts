#!/usr/bin/env ts-node

import { TreeBaseFolder, TreeBaseFile } from "./TreeBase"

const { jtree } = require("../index.js")

const { Disk } = require("../products/Disk.node.js")

const folderPath = require("path").resolve(__dirname + "/planets/")
const testTree: any = {}

const getFolder = () => {
  const iHateTypeScript = <any>TreeBaseFolder
  return new iHateTypeScript(undefined, folderPath)
}

testTree.all = (equal: any) => {
  const folder = getFolder()
  const errs = folder.toProgram().getAllErrors()
  equal(errs.length, 0, "no errors")
  if (errs.length) console.log(errs.join("\n"))
}

testTree.sqlLite = (equal: any) => {
  // Arrange
  const folder = getFolder()
  // Act/Assert
  equal(folder.toSQLite(), Disk.read(__dirname + "/planets.sql"), "sqlite works")
}

testTree.fileSystemEvents = async (equal: any) => {
  // Arrange
  const folder = getFolder()
  folder.loadFolder()
  folder.startListeningForFileChanges()
  const newFilePath = folderPath + "/foobar.planet"

  // Arrange
  let fileAdded = ""
  let waiting: any
  waiting = new Promise(resolve => {
    folder.onChildAdded((event: any) => {
      fileAdded = event.targetNode.getLine()
      // Assert
      equal(fileAdded, newFilePath, "new file detected")
      resolve()
    })
    // Act
    Disk.write(newFilePath, "")
  })
  await waiting

  // Arrange
  let newContent = ""
  const expectedContent = "hello world"
  waiting = new Promise(resolve => {
    folder.onDescendantChanged((event: any) => {
      const fileNode = event.targetNode.getAncestorByNodeConstructor(TreeBaseFile)

      // Assert
      equal(fileNode.childrenToString(), expectedContent, "file change detected")
      resolve()
      return true // remove after running once
    })
    // Act
    Disk.write(newFilePath, expectedContent)
  })
  await waiting

  // Arrange
  let fileRemoved = ""
  waiting = new Promise(resolve => {
    folder.onChildRemoved((event: any) => {
      fileRemoved = event.targetNode.getLine()
      // Assert
      equal(fileRemoved, newFilePath, "file remove expected")
      resolve()
    })
    // Act
    Disk.rm(newFilePath)
  })
  await waiting

  folder.stopListeningForFileChanges()
}

/*NODE_JS_ONLY*/ if (!module.parent) jtree.TestRacer.testSingleFile(__filename, testTree)
export { testTree }
