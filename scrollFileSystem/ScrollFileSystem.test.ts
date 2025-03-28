#!/usr/bin/env ts-node
const { Particle } = require("../products/Particle.js")
const { ScrollFileSystem, ScrollFile } = require("../products/ScrollFileSystem.js")
const { TestRacer } = require("../products/TestRacer.js")
const path = require("path")
import { particlesTypes } from "../products/particlesTypes"

const testParticles: particlesTypes.testParticles = {}

testParticles.disk = async equal => {
  const tfs = new ScrollFileSystem()
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
  const tfs = new ScrollFileSystem(files)
  equal(tfs.dirname("/"), "/")
  const mainResult = await tfs.fuseFile("/main")
  equal(stripImported(mainResult.fused), "world\nciao")

  const relativeResult = await tfs.fuseFile("/nested/deep/relative")
  equal(stripImported(relativeResult.fused), "world\nciao")
  equal(mainResult.exists, true)
}

testParticles.empty = async equal => {
  // Arrange
  const files = {
    "/hello": "",
    "/main": "import hello\nhi"
  }
  const tfs = new ScrollFileSystem(files)
  // Act
  const mainResult = await tfs.fuseFile("/main")
  // Assert
  equal(stripImported(mainResult.fused), `\nhi`)
}

testParticles.nonExistant = async equal => {
  // Arrange/Act/Assert
  const files = {
    "/main": "import env"
  }
  const tfs = new ScrollFileSystem(files)
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
  const tfs = new ScrollFileSystem(files)
  const result = await tfs.fuseFile("/hello.scroll")
  equal(result.fused.includes("This is my content"), true)
  equal(result.fused.includes("The end"), false)
  equal(result.footers[0], "The end.")
}

testParticles.circularImports = async equal => {
  const files = {
    "/a.scroll": "b.scroll",
    "/b.scroll": "a.scroll",
    "/c.scroll": "c.scroll",
    "/d.scroll": "e.scroll\nf.scroll",
    "/e.scroll": "f.scroll",
    "/f.scroll": "g.scroll",
    "/g.scroll": ""
  }
  const tfs = new ScrollFileSystem(files)
  const result2 = await tfs.fuseFile("/c.scroll")
  equal(result2.fused.includes("Circular import detected"), true, "Should have detected circularImports")
  const result = await tfs.fuseFile("/a.scroll")
  equal(result.fused.includes("Circular import detected"), true, "Should have detected circularImports")
  const result3 = await tfs.fuseFile("/d.scroll")
  equal(result3.fused.includes("Circular import detected"), false, "No circularImports detected")
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
  const tfs = new ScrollFileSystem(files)
  equal(tfs.dirname("/"), "/")

  const [aResult, mainResult, relativeResult] = await Promise.all([tfs.fuseFile("/nested/a"), tfs.fuseFile("/main"), tfs.fuseFile("/nested/deep/relative")])

  equal(stripImported(aResult.fused), "ciao")
  equal(stripImported(mainResult.fused), "world\nciao")
  equal(stripImported(relativeResult.fused), "world\nciao")

  // FileAPI
  // Arrange
  const file = new ScrollFile(files["/main"], "/main", tfs)
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
