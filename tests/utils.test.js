#! /usr/bin/env node

// todo: make isomorphic

const jtree = require("../index.js")

const testTree = {}

testTree.version = equal => {
  // Arrange/Act/Assert
  equal(!!jtree.getVersion(), true)
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
  equal(jtree.Utils._getParentFolder(`foobar/FooBam.js`), "foobar/")
  equal(jtree.Utils._getParentFolder(`/`), "/")
  equal(jtree.Utils._getParentFolder(`/bam`), "/")
  equal(jtree.Utils._getParentFolder(`/bam/`), "/")
  equal(jtree.Utils._getParentFolder(`/bam/boom`), "/bam/")
  equal(jtree.Utils._getParentFolder(`/bam/boom/`), "/bam/")
  equal(jtree.Utils._getParentFolder(`/bam/boom/bah`), "/bam/boom/")
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
  a.sort(jtree.Utils._makeGraphSortFunction(node => node.getWord(0), node => node.getWord(1)))

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

/*NODE_JS_ONLY*/ if (!module.parent) require("../builder/testTreeRunner.js")(testTree)
module.exports = testTree
