#!/usr/bin/env ts-node

const { DesignerApp } = require("./DesignerApp")

const { TestRacer } = require("../products/TestRacer.js")

const testParticles: any = {}

testParticles.basics = (equal: any) => {
  const app = new DesignerApp()
  equal(true, true) // todo: add tests
}

/*NODE_JS_ONLY*/ if (!module.parent) TestRacer.testSingleFile(__filename, testParticles)
export { testParticles }
