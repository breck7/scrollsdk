#!/usr/bin/env ts-node
"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
const TreeBase_1 = require("./TreeBase")
const testTree = {}
testTree.all = equal => {
  const folderPath = require("path").resolve(__dirname + "/planets/")
  const folder = new TreeBase_1.TreeBaseFolder(undefined, folderPath)
  const errs = folder._getAsProgram().getAllErrors()
  equal(errs.length, 0, "no errors")
  if (errs.length) console.log(errs.join("\n"))
}
/*NODE_JS_ONLY*/ if (!module.parent) require("../builder/testTreeRunner.js")(testTree)
module.exports = testTree
