#!/usr/bin/env ts-node

import { Column } from "./Column"

import { treeNotationTypes } from "../products/treeNotationTypes"

const { jtree } = require("../index.js")

const testTree: treeNotationTypes.testTree = {}

testTree.all = equal => {
  // Arrange
  const col = new Column({ name: "amount" }, [])

  // Assert
  equal(col.getColumnName(), "amount")
}

testTree.quantity = equal => {
  // Arrange
  const gallons = [2087, 2451, 1968, 2365, 2075, 2757, 2047, 3051, 7309, 4597, 1484, 1967, 2335, 1483, 1429, 1544, 1931]
  const col = new Column({ name: "Gallons" }, gallons)

  // Assert
  equal(col.getColumnName(), "Gallons")
  equal(col.isNumeric(), true)
  equal(col.getMax(), 7309)
}

testTree.negatives = equal => {
  // Arrange
  const gallons = [-1.0, -2.2, 10.1, -123.2, 0]
  const col = new Column({ name: "Gallons" }, gallons)

  // Assert
  equal(col.getColumnName(), "Gallons")
  equal(col.isNumeric(), true)
  equal(col.getMin(), -123.2)
}

testTree.dateColumn = equal => {
  // Arrange
  const dates = ["1/10/2015", "1/28/2015", "2/26/2015", "3/25/2015", "4/23/2015", "5/15/2015", "6/15/2015", "7/10/2015", "8/25/2015", "9/10/2015", "10/14/2015", "11/7/2015", "12/12/2015", "2/3/2016", "3/8/2016", "4/28/2016", "5/19/2016"]
  const col = new Column({ name: "PaidOn" }, dates)

  // Assert
  equal(col.getColumnName(), "PaidOn")
  equal(col.isTemporal(), true)

  // Conversion
  equal(Column.convertValueToNumeric("2/3/2016", "day", "year"), 2016)
}

testTree.usd = equal => {
  // Arrange
  const col = new Column({ name: "Amount" }, "$64.86 $73.32 $62.65 $71.51 $65.03 $81.39 $65.01 $93.09 $196.58 $130.68 $55.03 $63.44 $71.88 $53.18 $52.05 $54.73 $64.57".split(" "))

  // Assert
  equal(col.getColumnName(), "Amount")
  equal(col.isNumeric(), true)
  equal(col.isString(), false)
  equal(col.getPrimitiveTypeName(), "usd")
  equal(col.getMax(), 196.58)
}

/*NODE_JS_ONLY*/ if (!module.parent) jtree.TestRacer.testSingleFile(__filename, testTree)
export { testTree }
