#!/usr/bin/env ts-node
const { Particle } = require("../products/Particle.js")
const { ScrollFileSystem, ScrollFile } = require("../products/ScrollFileSystem.js")
const { TestRacer } = require("../products/TestRacer.js")
const path = require("path")
import { particlesTypes } from "../products/particlesTypes"

const testParticles: particlesTypes.testParticles = {}

testParticles.disk = async equal => {
  const sfs = new ScrollFileSystem()
  // Arrange/Act/Assert
  const file = await sfs.getFusedFile(path.join(__dirname, "..", "readme.scroll"))
  equal(file.scrollProgram.toString().length > 0, true)
}

/*NODE_JS_ONLY*/ if (!module.parent) {
  // Update TestRacer to handle async tests
  const runTests = async () => {
    await TestRacer.testSingleFile(__filename, testParticles)
  }
  runTests()
}

export { testParticles }
