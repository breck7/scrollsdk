#!/usr/bin/env ts-node

import { TreeBaseFolder } from "./TreeBase"

const testTree: any = {}

testTree.all = (equal: any) => {
  const folderPath = require("path").resolve(__dirname + "/planets/")
  const iHateTypeScript = <any>TreeBaseFolder
  const folder = new iHateTypeScript(undefined, folderPath)
  const errs = folder._getAsProgram().getAllErrors()
  equal(errs.length, 0, "no errors")
  if (errs.length) console.log(errs.join("\n"))
}

/*NODE_JS_ONLY*/ if (!module.parent) require("../products/jtree.node.js").Utils.runTestTree(testTree)
export { testTree }
