#!/usr/bin/env ts-node

const { ParticleFileSystem } = require("../products/ParticleFileSystem.js")
const { TestRacer } = require("../products/TestRacer.js")
const path = require("path")
import { scrollNotationTypes } from "../products/scrollNotationTypes"

const testParticles: scrollNotationTypes.testParticles = {}

testParticles.disk = equal => {
  const tfs = new ParticleFileSystem()
  // Arrange/Act/Assert
  equal(tfs.assembleFile(path.join(__dirname, "..", "readme.scroll")).afterImportPass.length > 0, true)
}

testParticles.inMemory = equal => {
  // Arrange/Act/Assert
  const files = {
    "/hello": "world",
    "/main": "import hello\nimport nested/test",
    "/nested/test": "ciao",
    "/nested/deep/relative": "import ../../hello\nimport ../test"
  }
  const tfs = new ParticleFileSystem(files)
  equal(tfs.dirname("/"), "/")
  equal(tfs.assembleFile("/main").afterImportPass, "world\nciao")
  equal(tfs.assembleFile("/nested/deep/relative").afterImportPass, "world\nciao")
}

/*NODE_JS_ONLY*/ if (!module.parent) TestRacer.testSingleFile(__filename, testParticles)

export { testParticles }
