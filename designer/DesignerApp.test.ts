#!/usr/bin/env ts-node

import { DesignerApp } from "./DesignerApp"

const { jtree } = require("../index.js")

const testTree: any = {}

testTree.basics = (equal: any) => {
  equal(true, true) // todo: add tests
}

/*NODE_JS_ONLY*/ if (!module.parent) require("../index.js").jtree.Utils.runTestTree(testTree)
export { testTree }
