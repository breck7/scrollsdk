#!/usr/bin/env ts-node

import { scrollNotationTypes } from "../products/scrollNotationTypes"

const { Particle } = require("../products/Particle.js")
const { Disk } = require("../products/Disk.node.js")
const { Utils } = require("../products/Utils.js")
const { TestRacer } = require("../products/TestRacer.js")
const { ParsersCompiler } = require("../products/ParsersCompiler.js")

const testParticles: scrollNotationTypes.testParticles = {}

testParticles.compileParsersAndCreateProgram = equal => {
  // Arrange
  const jibberishRootDir = __dirname + "/../langs/jibberish/"
  const programPath = jibberishRootDir + "sample.jibberish"
  const parsersPath = jibberishRootDir + "jibberish.parsers"

  // Act
  const program = ParsersCompiler.compileParsersAndCreateProgram(programPath, parsersPath)
  const result = program.execute()

  // Assert
  equal(program.constructor.name, "jibberishParser", "parent program class parsed correctly")
  equal(result, 42)
}

testParticles.combineTests = equal => {
  // Arrange
  const combined = ParsersCompiler.combineFiles([__dirname + "/*.swarm"])

  // Act/Assert
  equal(combined.toString().includes("constructWithParagraph"), true, "Included something from a swarm file")
}

testParticles.diskTests = equal => {
  // Arrange
  const path = __dirname + `/temp-disk.csv`

  // Assert
  equal(Disk.exists(path), false, "file does not exist")

  // Arrange
  const particle = Particle.fromCsv(Particle.iris)
  particle.toDisk(path)

  // Act/Assert
  equal(Disk.exists(path), true, "file exists")
  equal(Particle.fromDisk(path).toString(), particle.toString(), "particle unchanged")

  // Cleanup
  Disk.rm(path)

  // Assert
  equal(Disk.exists(path), false, "file does not exist")
}

testParticles.findProjectRoot = equal => {
  const dir = Utils.findProjectRoot(__dirname, "scrollsdk")
  equal(typeof dir, "string")
  equal(dir.includes("parsers"), false, "correct parent dir selected")

  try {
    const result = Utils.findProjectRoot("/foo/bar/", "scrollsdk")
    equal(result, false, "error should have been thrown")
  } catch (err) {
    equal(true, true, "error thrown")
  }

  try {
    Utils.findProjectRoot(__dirname + "/../", "fakeproject")
    equal(true, false, "error should have been thrown")
  } catch (err) {
    equal(true, true, "error thrown")
  }
}

/*NODE_JS_ONLY*/ if (!module.parent) TestRacer.testSingleFile(__filename, testParticles)

export { testParticles }
