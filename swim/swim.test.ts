#!/usr/bin/env ts-node

import { particlesTypes } from "../products/particlesTypes"

const { Particle } = require("../products/Particle.js")
const { TestRacer } = require("../products/TestRacer.js")

const testParticles: particlesTypes.testParticles = {}

testParticles.runSwimTests = equal => {
  // Arrange/Act/Assert
  const tests = Particle.fromDisk(__dirname + "/Particle.swim")
  tests.forEach((test: any) => {
    const arrange = test.getParticle("arrange").subparticlesToString() // Note: used in the eval below
    const expected = test.getParticle("assert").subparticlesToString()
    const code = test.getParticle("act").subparticlesToString()
    equal(eval(code), expected, test.getLine())
  })
}

/*NODE_JS_ONLY*/ if (!module.parent) TestRacer.testSingleFile(__filename, testParticles)

export { testParticles }
