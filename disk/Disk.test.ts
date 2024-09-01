#!/usr/bin/env ts-node

import { particlesTypes } from "../products/particlesTypes"
const { Disk } = require("../products/Disk.node.js")
const { TestRacer } = require("../products/TestRacer.js")

const testParticles: particlesTypes.testParticles = {}

testParticles.exists = equal => {
  // Arrange/Act/Assert
  equal(Disk.exists(__filename), true)
}

/*NODE_JS_ONLY*/ if (!module.parent) TestRacer.testSingleFile(__filename, testParticles)

export { testParticles }
