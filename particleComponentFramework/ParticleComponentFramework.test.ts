#!/usr/bin/env ts-node

import { AbstractParticleComponentParser } from "./ParticleComponentFramework"
const { Particle } = require("../products/Particle.js")
const { TestRacer } = require("../products/TestRacer.js")

const testParticles: any = {}

class TestApp extends AbstractParticleComponentParser {
  createParserPool() {
    return new Particle.ParserPool(undefined, {
      headerComponent: headerComponent
    })
  }
}

class headerComponent extends AbstractParticleComponentParser {}

testParticles.all = (equal: any) => {
  // Arrange
  const app = new TestApp()

  // Assert
  equal(!!app.getTheme(), true, "get theme")
  equal(!!app.willowBrowser, true, "get willow")

  equal(app.willowBrowser.toPrettyDeepLink(`foo bar`, { filename: "bam.foo" }), "http://localhost:8000/index.html?filename=bam.foo&particleBreakSymbol=%7E&edgeSymbol=_&data=foo_bar")
}

/*NODE_JS_ONLY*/ if (!module.parent) TestRacer.testSingleFile(__filename, testParticles)

export { testParticles }
