#!/usr/bin/env ts-node

import { Table } from "./Table"
import { Row } from "./Row"

import { treeNotationTypes } from "../products/treeNotationTypes"

const { jtree } = require("../index.js")

const testTree: treeNotationTypes.testTree = {}

testTree.all = equal => {
  const source = {
    name: "joe",
    size: "small"
  }
  // Act/Assert
  const table = new Table()
  const row = new Row(source, table)

  // Assert
  equal(!!row._getUniqueId(), true)

  const arr = row.getAsArray(["name", "size"])

  // Assert
  equal(arr.length, 2)
}

/*NODE_JS_ONLY*/ if (!module.parent) jtree.TestRacer.testSingleFile(__filename, testTree)
export { testTree }
