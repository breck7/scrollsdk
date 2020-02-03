#!/usr/bin/env ts-node

// todo: make isomorphic

const { jtree } = require("../index.js")
import { treeNotationTypes } from "../products/treeNotationTypes"

const testTree: treeNotationTypes.testTree = {}

testTree.version = equal => {
  // Arrange/Act/Assert
  equal(!!jtree.getVersion(), true)
}

testTree.vector = equal => {
  // Arrange/Act/Assert
  equal(jtree.Utils.sum(jtree.Utils.makeVector(5, 3)), 15)
}

testTree.getNextOrPrevious = equal => {
  // A/A/A
  equal(jtree.Utils.getNextOrPrevious([1, 2, 3], 2), 3)
}

testTree.didYouMean = equal => {
  // Arrange/Act/Assert
  const didYouMean = jtree.Utils.didYouMean
  equal(didYouMean("lamr", ["couch", "sofa", "lamp"]), "lamp")
  equal(didYouMean("asfsaf", ["couch", "sofa", "lamp"]), undefined)
  equal(didYouMean("famp", ["couch", "camp", "lamp"]), "camp")
  equal(didYouMean("height", ["Height", "weight", "sign"]), "Height")
}

testTree.getLineIndexAtCharacterPosition = equal => {
  // Arrange/Act/Assert
  equal(jtree.Utils.getClassNameFromFilePath(`foobar/FooBam.js`), "FooBam")
}

testTree.getParentFolder = equal => {
  // Arrange/Act/Assert
  equal(jtree.Utils.getParentFolder(`foobar/FooBam.js`), "foobar/")
  equal(jtree.Utils.getParentFolder(`/`), "/")
  equal(jtree.Utils.getParentFolder(`/bam`), "/")
  equal(jtree.Utils.getParentFolder(`/bam/`), "/")
  equal(jtree.Utils.getParentFolder(`/bam/boom`), "/bam/")
  equal(jtree.Utils.getParentFolder(`/bam/boom/`), "/bam/")
  equal(jtree.Utils.getParentFolder(`/bam/boom/bah`), "/bam/boom/")
}

testTree.getUniqueWordsArray = equal => {
  equal(jtree.Utils.getUniqueWordsArray(`hi hi hey`).length, 2)
}

testTree.ucfirst = equal => {
  equal(jtree.Utils.ucfirst(`hi`), "Hi")
}

testTree.getLineIndexAtCharacterPosition = equal => {
  // Arrange/Act/Assert
  const Utils = jtree.Utils
  equal(Utils.getLineIndexAtCharacterPosition(`abc`, 0), 0)
  equal(Utils.getLineIndexAtCharacterPosition(`abc`, 2), 0)
  equal(Utils.getLineIndexAtCharacterPosition(`abc\n`, 3), 0)
  equal(Utils.getLineIndexAtCharacterPosition(`abc\na`, 4), 1)
  equal(Utils.getLineIndexAtCharacterPosition(``, 0), 0)
}

testTree.graphSort = equal => {
  // Arrange
  const a = new jtree.TreeNode(`dog animal
animal
retriever dog
car
cat animal
house`)
  a.sort(jtree.Utils._makeGraphSortFunction((node: any) => node.getWord(0), (node: any) => node.getWord(1)))

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
  equal(new jtree.TreeNode(jtree.Utils.makeRandomTree(2)).getTopDownArray().length, 3)
}

testTree.makeSemiRandomFn = equal => {
  const rand = jtree.Utils.makeSemiRandomFn(1)
  const first = rand()
  const expected = 0.7098480789645691
  equal(first, expected)
  equal(jtree.Utils.makeSemiRandomFn(1)(), expected)
  equal(rand() !== first, true)

  equal(jtree.Utils.randomUniformFloat(0, 100, 2), 97.42682568175951)
  equal(jtree.Utils.randomUniformInt(0, 100, 2), 97)
}

/*NODE_JS_ONLY*/ if (!module.parent) jtree.TestRacer.testSingleFile(__filename, testTree)

export { testTree }
