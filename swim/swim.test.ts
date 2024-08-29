#!/usr/bin/env ts-node

import { scrollNotationTypes } from "../products/scrollNotationTypes"

const { Particle } = require("../products/Particle.js")
const { TestRacer } = require("../products/TestRacer.js")

const testParticles: scrollNotationTypes.testParticles = {}

testParticles.runSwimTests = equal => {
  // Arrange/Act/Assert
  const tests = Particle.fromDisk(__dirname + "/Particle.swim")
  tests.forEach((test: any) => {
    const arrange = test.getParticle("arrange").childrenToString() // Note: used in the eval below
    const expected = test.getParticle("assert").childrenToString()
    const code = test.getParticle("act").childrenToString()
    equal(eval(code), expected, test.getLine())
  })
}

/*NODE_JS_ONLY*/ if (!module.parent) TestRacer.testSingleFile(__filename, testParticles)

export { testParticles }
