#!/usr/bin/env ts-node

import { scrollNotationTypes } from "../products/scrollNotationTypes"

const { Particle } = require("../products/Particle.js")
const { TestRacer } = require("../products/TestRacer.js")

const testTree: scrollNotationTypes.testTree = {}

testTree.runSwimTests = equal => {
  // Arrange/Act/Assert
  const tests = Particle.fromDisk(__dirname + "/Particle.swim")
  tests.forEach((test: any) => {
    const arrange = test.getNode("arrange").childrenToString() // Note: used in the eval below
    const expected = test.getNode("assert").childrenToString()
    const code = test.getNode("act").childrenToString()
    equal(eval(code), expected, test.getLine())
  })
}

/*NODE_JS_ONLY*/ if (!module.parent) TestRacer.testSingleFile(__filename, testTree)

export { testTree }
