#!/usr/bin/env ts-node

const { Particle } = require("../products/Particle.js")
const { Fusion } = require("../products/Fusion.js")
const { TestRacer } = require("../products/TestRacer.js")
const path = require("path")
import { particlesTypes } from "../products/particlesTypes"

const testParticles: particlesTypes.testParticles = {}

testParticles.disk = equal => {
  const tfs = new Fusion()
  // Arrange/Act/Assert
  equal(tfs.fuseFile(path.join(__dirname, "..", "readme.scroll")).fused.length > 0, true)
}

const stripImported = (str: string) => {
  const particle = new Particle(str)
  particle.getParticles("imported").forEach((particle: any) => particle.destroy())
  return particle.toString()
}

testParticles.inMemory = equal => {
  // Arrange/Act/Assert
  const files = {
    "/hello": "world",
    "/main": "import hello\nimport nested/test",
    "/nested/test": "ciao",
    "/nested/deep/relative": "import ../../hello\nimport ../test"
  }
  const tfs = new Fusion(files)
  equal(tfs.dirname("/"), "/")
  equal(stripImported(tfs.fuseFile("/main").fused), "world\nciao")
  equal(stripImported(tfs.fuseFile("/nested/deep/relative").fused), "world\nciao")
  equal(tfs.fuseFile("/main").exists, true)
}

testParticles.nonExistant = equal => {
  // Arrange/Act/Assert
  const files = {
    "/main": "import env"
  }
  const tfs = new Fusion(files)
  const result = tfs.fuseFile("/main")
  equal(stripImported(result.fused), "")
  equal(result.exists, false)
}

testParticles.footers = equal => {
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
  const result = tfs.fuseFile("/hello.scroll")
  equal(result.fused.includes("This is my content"), true)
  equal(result.fused.includes("The end"), false)
  equal(result.footers[0], "The end.")
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
  const tfs = new Fusion(files)
  equal(tfs.dirname("/"), "/")
  equal(stripImported(tfs.fuseFile("/nested/a").fused), "ciao")
  equal(stripImported(tfs.fuseFile("/main").fused), "world\nciao")
  equal(stripImported(tfs.fuseFile("/nested/deep/relative").fused), "world\nciao")
}

/*NODE_JS_ONLY*/ if (!module.parent) TestRacer.testSingleFile(__filename, testParticles)

export { testParticles }
