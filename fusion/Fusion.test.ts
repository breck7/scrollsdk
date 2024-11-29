#!/usr/bin/env ts-node
const { Particle } = require("../products/Particle.js")
const { Fusion, FusionFile } = require("../products/Fusion.js")
const { TestRacer } = require("../products/TestRacer.js")
const path = require("path")
import { particlesTypes } from "../products/particlesTypes"

const testParticles: particlesTypes.testParticles = {}

testParticles.disk = async equal => {
  const tfs = new Fusion()
  // Arrange/Act/Assert
  const result = await tfs.fuseFile(path.join(__dirname, "..", "readme.scroll"))
  equal(result.fused.length > 0, true)
}

const stripImported = (str: string) => {
  const particle = new Particle(str)
  particle.getParticles("imported").forEach((particle: any) => particle.destroy())
  return particle.toString()
}

testParticles.inMemory = async equal => {
  // Arrange/Act/Assert
  const files = {
    "/hello": "world",
    "/main": "import hello\nimport nested/test",
    "/nested/test": "ciao",
    "/nested/deep/relative": "import ../../hello\nimport ../test"
  }
  const tfs = new Fusion(files)
  equal(tfs.dirname("/"), "/")
  const mainResult = await tfs.fuseFile("/main")
  equal(stripImported(mainResult.fused), "world\nciao")

  const relativeResult = await tfs.fuseFile("/nested/deep/relative")
  equal(stripImported(relativeResult.fused), "world\nciao")
  equal(mainResult.exists, true)
}

testParticles.nonExistant = async equal => {
  // Arrange/Act/Assert
  const files = {
    "/main": "import env"
  }
  const tfs = new Fusion(files)
  const result = await tfs.fuseFile("/main")
  equal(stripImported(result.fused), "")
  equal(result.exists, false)
}

testParticles.footers = async equal => {
  // Arrange/Act/Assert
  const files = {
    "/hello.scroll": `headerAndFooter.scroll
title Hello world
This is my content
`,
    "/headerAndFooter.scroll": "header.scroll\nfooter.scroll\n footer",
    "/header.scroll": "printTitle",
    "/footer.scroll": "The end."
  }
  const tfs = new Fusion(files)
  const result = await tfs.fuseFile("/hello.scroll")
  equal(result.fused.includes("This is my content"), true)
  equal(result.fused.includes("The end"), false)
  equal(result.footers[0], "The end.")
}

testParticles.quickImports = async equal => {
  // Arrange/Act/Assert
  const files = {
    "/hello.scroll": "world",
    "/main": "hello.scroll\nnested/test.scroll",
    "/nested/test.scroll": "ciao",
    "/nested/a": "test.scroll",
    "/nested/deep/relative": "../../hello.scroll\n../test.scroll"
  }
  const tfs = new Fusion(files)
  equal(tfs.dirname("/"), "/")

  const [aResult, mainResult, relativeResult] = await Promise.all([tfs.fuseFile("/nested/a"), tfs.fuseFile("/main"), tfs.fuseFile("/nested/deep/relative")])

  equal(stripImported(aResult.fused), "ciao")
  equal(stripImported(mainResult.fused), "world\nciao")
  equal(stripImported(relativeResult.fused), "world\nciao")

  // FileAPI
  // Arrange
  const file = new FusionFile(files["/main"], "/main", tfs)
  equal(file.fusedCode, undefined)
  // Act
  await file.fuse()
  // Assert
  equal(stripImported(file.fusedCode), "world\nciao")
}

/*NODE_JS_ONLY*/ if (!module.parent) {
  // Update TestRacer to handle async tests
  const runTests = async () => {
    await TestRacer.testSingleFile(__filename, testParticles)
  }
  runTests()
}

export { testParticles }
