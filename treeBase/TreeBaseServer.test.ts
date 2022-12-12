#!/usr/bin/env ts-node

import { TreeBaseFolder, TreeBaseFile } from "./TreeBase"
import { TreeBaseServer } from "./TreeBaseServer"

const path = require("path")
const { jtree } = require("../index.js")
const { Disk } = require("../products/Disk.node.js")

const folderPath = path.join(__dirname, "planets")
const testTree: any = {}

const getFolder = () => new TreeBaseFolder().setDir(folderPath).setGrammarDir(folderPath)

testTree.basics = (equal: any) => {
  const folder = getFolder().loadFolder()
  const searchServer = new TreeBaseServer(folder).searchServer
  const results = searchServer.search("planet", "namesOnly")
  equal(results.length, 1)
}

/*NODE_JS_ONLY*/ if (!module.parent) jtree.TestRacer.testSingleFile(__filename, testTree)
export { testTree }
