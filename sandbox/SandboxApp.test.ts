#!/usr/bin/env ts-node

const { SandboxApp } = require("./SandboxApp")

const { TestRacer } = require("../products/TestRacer.js")

const testTree: any = {}

testTree.basics = (equal: any) => {
  const app = new SandboxApp()
  equal(!!app, true)
}

/*NODE_JS_ONLY*/ if (!module.parent) TestRacer.testSingleFile(__filename, testTree)
export { testTree }
