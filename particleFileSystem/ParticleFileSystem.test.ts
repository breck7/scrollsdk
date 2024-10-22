#!/usr/bin/env ts-node

const { ParticleFileSystem } = require("../products/ParticleFileSystem.js")
const { TestRacer } = require("../products/TestRacer.js")
const path = require("path")
import { particlesTypes } from "../products/particlesTypes"

const testParticles: particlesTypes.testParticles = {}

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
  equal(tfs.assembleFile("/main").exists, true)
}

testParticles.nonExistant = equal => {
  // Arrange/Act/Assert
  const files = {
    "/main": "import env"
  }
  const tfs = new ParticleFileSystem(files)
  const result = tfs.assembleFile("/main")
  equal(result.afterImportPass, "")
  equal(result.exists, false)
}

testParticles.quickImports = equal => {
  // Arrange/Act/Assert
  const files = {
    "/hello.scroll": "world",
    "/main": "hello.scroll\nnested/test.scroll",
    "/nested/test.scroll": "ciao",
    "/nested/a": "test.scroll",
    "/nested/deep/relative": "../../hello.scroll\n../test.scroll"
  }
  const tfs = new ParticleFileSystem(files)
  equal(tfs.dirname("/"), "/")
  equal(tfs.assembleFile("/nested/a").afterImportPass, "ciao")
  equal(tfs.assembleFile("/main").afterImportPass, "world\nciao")
  equal(tfs.assembleFile("/nested/deep/relative").afterImportPass, "world\nciao")
}

/*NODE_JS_ONLY*/ if (!module.parent) TestRacer.testSingleFile(__filename, testParticles)

export { testParticles }
