#!/usr/bin/env ts-node

import { scrollNotationTypes } from "../products/scrollNotationTypes"
const { Disk } = require("../products/Disk.node.js")
const { TestRacer } = require("../products/TestRacer.js")

const testParticles: scrollNotationTypes.testParticles = {}

testParticles.exists = equal => {
  // Arrange/Act/Assert
  equal(Disk.exists(__filename), true)
}

/*NODE_JS_ONLY*/ if (!module.parent) TestRacer.testSingleFile(__filename, testParticles)

export { testParticles }
