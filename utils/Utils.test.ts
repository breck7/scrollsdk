#!/usr/bin/env ts-node

// todo: make isomorphic

import { scrollNotationTypes } from "../products/scrollNotationTypes"
const { Utils } = require("../products/Utils.js")
const { TreeNode } = require("../products/TreeNode.js")
const { TestRacer } = require("../products/TestRacer.js")

const testTree: scrollNotationTypes.testTree = {}

testTree.version = equal => {
  // Arrange/Act/Assert
  equal(!!TreeNode.getVersion(), true)
}

testTree.vector = equal => {
  // Arrange/Act/Assert
  equal(Utils.sum(Utils.makeVector(5, 3)), 15)
}

testTree.titleToPermalink = equal => {
  // Arrange/Act/Assert
  equal(Utils.titleToPermalink("C#"), "c-sharp")
}

testTree.isAbsoluteUrl = equal => {
  // AAA
  equal(Utils.isAbsoluteUrl("https://"), true)
  equal(Utils.isAbsoluteUrl("http://"), true)
  equal(Utils.isAbsoluteUrl("link.html"), false)
}

testTree.getNextOrPrevious = equal => {
  // A/A/A
  equal(Utils.getNextOrPrevious([1, 2, 3], 2), 3)
}

testTree.getRandomCharacters = equal => {
  // AAA
  equal(Utils.getRandomCharacters(9).length, 9)
}

testTree.didYouMean = equal => {
  // Arrange/Act/Assert
  const didYouMean = Utils.didYouMean
  equal(didYouMean("lamr", ["couch", "sofa", "lamp"]), "lamp")
  equal(didYouMean("asfsaf", ["couch", "sofa", "lamp"]), undefined)
  equal(didYouMean("famp", ["couch", "camp", "lamp"]), "camp")
  equal(didYouMean("height", ["Height", "weight", "sign"]), "Height")
}

testTree.getLineIndexAtCharacterPosition = equal => {
  // Arrange/Act/Assert
  equal(Utils.getClassNameFromFilePath(`foobar/FooBam.js`), "FooBam")
}

testTree.getParentFolder = equal => {
  // Arrange/Act/Assert
  equal(Utils.getParentFolder(`foobar/FooBam.js`), "foobar/")
  equal(Utils.getParentFolder(`/`), "/")
  equal(Utils.getParentFolder(`/bam`), "/")
  equal(Utils.getParentFolder(`/bam/`), "/")
  equal(Utils.getParentFolder(`/bam/boom`), "/bam/")
  equal(Utils.getParentFolder(`/bam/boom/`), "/bam/")
  equal(Utils.getParentFolder(`/bam/boom/bah`), "/bam/boom/")
}

testTree.getUniqueWordsArray = equal => {
  equal(Utils.getUniqueWordsArray(`hi hi hey`).length, 2)
}

testTree.ucfirst = equal => {
  equal(Utils.ucfirst(`hi`), "Hi")
}

testTree.getLineIndexAtCharacterPosition = equal => {
  // Arrange/Act/Assert
  equal(Utils.getLineIndexAtCharacterPosition(`abc`, 0), 0)
  equal(Utils.getLineIndexAtCharacterPosition(`abc`, 2), 0)
  equal(Utils.getLineIndexAtCharacterPosition(`abc\n`, 3), 0)
  equal(Utils.getLineIndexAtCharacterPosition(`abc\na`, 4), 1)
  equal(Utils.getLineIndexAtCharacterPosition(``, 0), 0)
}

testTree.graphSort = equal => {
  // Arrange
  const a = new TreeNode(`dog animal
animal
retriever dog
car
cat animal
house`)
  a.sort(
    Utils._makeGraphSortFunction(
      (node: any) => node.getWord(0),
      (node: any) => node.getWord(1)
    )
  )

  // Assert
  equal(
    a.toString(),
    `animal
car
house
cat animal
dog animal
retriever dog`
  )
}

testTree.makeRandomTree = equal => {
  // Arrange/Act/Assert
  equal(new TreeNode(Utils.makeRandomTree(2)).topDownArray.length, 3)
}

testTree.makeSemiRandomFn = equal => {
  const rand = Utils.makeSemiRandomFn(1)
  const first = rand()
  const expected = 0.7098480789645691
  equal(first, expected)
  equal(Utils.makeSemiRandomFn(1)(), expected)
  equal(rand() !== first, true)

  equal(Utils.randomUniformFloat(0, 100, 2), 97.42682568175951)
  equal(Utils.randomUniformInt(0, 100, 2), 97)
}

/*NODE_JS_ONLY*/ if (!module.parent) TestRacer.testSingleFile(__filename, testTree)

export { testTree }
