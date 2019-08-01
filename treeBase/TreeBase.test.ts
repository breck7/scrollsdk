#!/usr/bin/env ts-node

import { TreeBaseFolder } from "./TreeBase"

const testTree: any = {}

testTree.all = (equal: any) => {
  const folderPath = require("path").resolve(__dirname + "/planets/")
  const folder = new TreeBaseFolder(undefined, folderPath)
  const errs = folder._getAsProgram().getAllErrors()
  equal(errs.length, 0, "no errors")
  if (errs.length) console.log(errs.join("\n"))
}

/*NODE_JS_ONLY*/ if (!module.parent) require("../builder/testTreeRunner.js")(testTree)
module.exports = testTree
