#!/usr/bin/env ts-node

// todo: make isomorphic

import { particlesTypes } from "../products/particlesTypes"
const { Utils } = require("../products/Utils.js")
const { Particle } = require("../products/Particle.js")
const { TestRacer } = require("../products/TestRacer.js")

const testParticles: particlesTypes.testParticles = {}

testParticles.version = equal => {
  // Arrange/Act/Assert
  equal(!!Particle.getVersion(), true)
}

testParticles.vector = equal => {
  // Arrange/Act/Assert
  equal(Utils.sum(Utils.makeVector(5, 3)), 15)
}

testParticles.titleToPermalink = equal => {
  // Arrange/Act/Assert
  equal(Utils.titleToPermalink("C#"), "c-sharp")
}

testParticles.isAbsoluteUrl = equal => {
  // AAA
  equal(Utils.isAbsoluteUrl("https://"), true)
  equal(Utils.isAbsoluteUrl("http://"), true)
  equal(Utils.isAbsoluteUrl("link.html"), false)
}

testParticles.getNextOrPrevious = equal => {
  // A/A/A
  equal(Utils.getNextOrPrevious([1, 2, 3], 2), 3)
}

testParticles.getRandomCharacters = equal => {
  // AAA
  equal(Utils.getRandomCharacters(9).length, 9)
}

testParticles.didYouMean = equal => {
  // Arrange/Act/Assert
  const didYouMean = Utils.didYouMean
  equal(didYouMean("lamr", ["couch", "sofa", "lamp"]), "lamp")
  equal(didYouMean("asfsaf", ["couch", "sofa", "lamp"]), undefined)
  equal(didYouMean("famp", ["couch", "camp", "lamp"]), "camp")
  equal(didYouMean("height", ["Height", "weight", "sign"]), "Height")
}

testParticles.getLineIndexAtCharacterPosition = equal => {
  // Arrange/Act/Assert
  equal(Utils.getClassNameFromFilePath(`foobar/FooBam.js`), "FooBam")
}

testParticles.getParentFolder = equal => {
  // Arrange/Act/Assert
  equal(Utils.getParentFolder(`foobar/FooBam.js`), "foobar/")
  equal(Utils.getParentFolder(`/`), "/")
  equal(Utils.getParentFolder(`/bam`), "/")
  equal(Utils.getParentFolder(`/bam/`), "/")
  equal(Utils.getParentFolder(`/bam/boom`), "/bam/")
  equal(Utils.getParentFolder(`/bam/boom/`), "/bam/")
  equal(Utils.getParentFolder(`/bam/boom/bah`), "/bam/boom/")
}

testParticles.getUniqueWordsArray = equal => {
  equal(Utils.getUniqueWordsArray(`hi hi hey`).length, 2)
}

testParticles.ucfirst = equal => {
  equal(Utils.ucfirst(`hi`), "Hi")
}

testParticles.getLineIndexAtCharacterPosition = equal => {
  // Arrange/Act/Assert
  equal(Utils.getLineIndexAtCharacterPosition(`abc`, 0), 0)
  equal(Utils.getLineIndexAtCharacterPosition(`abc`, 2), 0)
  equal(Utils.getLineIndexAtCharacterPosition(`abc\n`, 3), 0)
  equal(Utils.getLineIndexAtCharacterPosition(`abc\na`, 4), 1)
  equal(Utils.getLineIndexAtCharacterPosition(``, 0), 0)
}

testParticles.graphSort = equal => {
  // Arrange
  const a = new Particle(`dog animal
animal
retriever dog
car
cat animal
house`)
  a.sort(
    Utils._makeGraphSortFunction(
      (particle: any) => particle.getWord(0),
      (particle: any) => particle.getWord(1)
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

testParticles.makeRandomParticles = equal => {
  // Arrange/Act/Assert
  equal(new Particle(Utils.makeRandomParticles(2)).topDownArray.length, 3)
}

testParticles.makeSemiRandomFn = equal => {
  const rand = Utils.makeSemiRandomFn(1)
  const first = rand()
  const expected = 0.7098480789645691
  equal(first, expected)
  equal(Utils.makeSemiRandomFn(1)(), expected)
  equal(rand() !== first, true)

  equal(Utils.randomUniformFloat(0, 100, 2), 97.42682568175951)
  equal(Utils.randomUniformInt(0, 100, 2), 97)
}

/*NODE_JS_ONLY*/ if (!module.parent) TestRacer.testSingleFile(__filename, testParticles)

export { testParticles }
