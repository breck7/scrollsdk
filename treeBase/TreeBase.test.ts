#!/usr/bin/env ts-node

import { TreeBaseFolder, TreeBaseFile } from "./TreeBase"

const path = require("path")
const { jtree } = require("../index.js")
const { Disk } = require("../products/Disk.node.js")


const folderPath = path.join(__dirname, "planets")
const testTree: any = {}

const getFolder = () => {
  const iHateTypeScriptSometimes = <any>TreeBaseFolder
  return new iHateTypeScriptSometimes(undefined, folderPath)
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
  equal(folder.toSQLite(), Disk.read(path.join(__dirname, "planets.sql")), "sqlite works")
}

testTree.toTypedMap = (equal: any) => {
  // Arrange
  const folder = getFolder()
  // Act/Assert
  const { typedMapShort } = folder

  equal(Object.values(typedMapShort).length, 8)
  equal(typedMapShort.neptune.surfaceGravity, 11)
  equal(typedMapShort.mercury.moons, 0)
  equal(typedMapShort.earth.title, "Earth")
  equal(typedMapShort.earth.neighbors.Mars, 110000000)
  equal(typedMapShort.earth.hasLife, true)
  equal(typedMapShort.earth.aka.length, 2)
  equal(typedMapShort.earth.wikipedia.id, "Earth")
  equal(typedMapShort.earth.wikipedia.pageViews, 123)
  equal(typedMapShort.earth.age.value, 4500000000)
  equal(typedMapShort.earth.age.description, "It was only during the 19th century that geologists realized Earth's age was at least many millions of years.")
  equal(typedMapShort.earth.description.split("\n").length, 2)
  equal(typedMapShort.earth.related[1], "venus")
}

testTree.fileSystemEvents = async (equal: any) => {
  // Arrange
  const folder = getFolder()
  folder.loadFolder()
  folder.startListeningForFileChanges()
  const newFilePath = path.join(folderPath, "foobar.planet")

  // Arrange
  let fileAdded = ""
  let waiting: any
  waiting = new Promise(resolve => {
    folder.onChildAdded((event: any) => {
      fileAdded = event.targetNode.getLine()
      // Assert
      equal(fileAdded, newFilePath, "new file detected")
      resolve(true)
    })
    // Act
    Disk.write(newFilePath, "")
  })
  await waiting

  // Arrange
  const expectedContent = "hello world"
  waiting = new Promise(resolve => {
    folder.onDescendantChanged((event: any) => {
      const fileNode = event.targetNode.getAncestorByNodeConstructor(TreeBaseFile)

      // Assert
      equal(fileNode.childrenToString(), expectedContent, "file change detected")
      resolve(true)
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
      resolve(true)
    })
    // Act
    Disk.rm(newFilePath)
  })
  await waiting

  folder.stopListeningForFileChanges()
}

/*NODE_JS_ONLY*/ if (!module.parent) jtree.TestRacer.testSingleFile(__filename, testTree)
export { testTree }
