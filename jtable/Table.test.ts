#!/usr/bin/env ts-node

import { Table, ComparisonOperators } from "./Table"
import { TableParser } from "./TableParser"
import { DummyDataSets } from "./DummyDataSets"

import { treeNotationTypes } from "../products/treeNotationTypes"

const { jtree } = require("../index.js")

const moment = require("moment")

const testTree: treeNotationTypes.testTree = {}

testTree.missing = equal => {
  // Arrange
  const input = `name,age
bob,
mike,55`
  const inputs = new TableParser().parseTableInputsFromString(input)
  const table = new Table(inputs.rows, undefined, undefined, undefined, 126)
  const columns = table.getColumnsArray()

  // Assert
  equal(columns[1].getPrimitiveTypeName(), "number")

  // Act
  const matrix = table.toMatrix()
  equal(matrix[1][1], 55)
}

testTree.fillMissing = equal => {
  const table = new Table([{ score: 2 }, {}])
  equal(table.getTableColumnByName("score").getReductions().min, 2)
  equal(
    table
      .fillMissing("score", 0)
      .getTableColumnByName("score")
      .getReductions().min,
    0
  )
}

testTree.synthesizeTable = equal => {
  // Arrange
  const data = jtree.Utils.javascriptTableWithHeaderRowToObjects(DummyDataSets.gapMinder)
  const table = new Table(data)
  // Act/Assert
  const synthTable = table.synthesizeTable(21, 123)
  equal(synthTable.getRowCount(), 21)
  equal(synthTable.getTableColumnByName("income").getReductions().max, 97)

  // Arrange/Act
  const schema = table
    .toSimpleSchema()
    .split("\n")
    .map(col => {
      const words = col.split(" ")
      return {
        name: words[0],
        type: <any>words[1]
      }
    })
  const table2 = new Table([], schema)
  const synthTable2 = table2.synthesizeTable(21, 123)
  equal(synthTable2.toDelimited(","), synthTable.toDelimited(","))
}

testTree.renameColumns = equal => {
  // Arrange
  const data = jtree.Utils.javascriptTableWithHeaderRowToObjects(DummyDataSets.regionalMarkets)
  const table = new Table(data)
  const newTable = table.cloneWithCleanColumnNames()
  const columns = newTable.getColumnsArray()

  // Assert
  equal(columns[2].getColumnName(), "Markettradevolumesize")
}

testTree.all = equal => {
  // Arrange
  const rows = [{ date: "1/10/2015" }, { date: "1/28/2015" }, { date: "2/26/2015" }, { date: "3/25/2015" }, { date: "4/23/2015" }]
  const table = new Table(rows, [{ source: "date", name: "year", type: "year" }])

  // Assert
  equal(table.getRowCount(), 5)
  equal(table.getColumnCount(), 2)

  // Act
  const vals = table.getJavascriptNativeTypedValues()
  const col = table.getColumnByName("year")
  // Assert
  equal(col.toDisplayString(vals[0].year), "2015", "Got correct numeric value")

  // Act
  const typedVals = table.getJavascriptNativeTypedValues()
  // Assert
  equal(<any>typedVals[0].year instanceof Date, true)

  // Act
  const result = table.getPredictionsForAPropertyNameToColumnNameMapGivenHintsNode(new jtree.TreeNode(`xAxis isString=false`), {})
  // Assert
  equal(result["xAxis"], "date")
}

testTree.vegaTest = equal => {
  // Arrange
  const rows = [["appeared", "count", "total"], [1941, 1, 1], [1943, 1, 2], [1947, 2, 4], [1948, 1, 5], [1949, 1, 6], [1950, 3, 9], [1951, 4, 13], [1952, 2, 15], [1953, 5, 20], [1954, 3, 23], [1955, 9, 32], [1956, 5, 37], [1957, 8, 45]]
  const table = new Table(jtree.Utils.javascriptTableWithHeaderRowToObjects(rows), [{ source: "appeared", name: "year", type: "year" }])

  // Assert
  const typedVals = table.getJavascriptNativeTypedValues()
  // Assert
  equal(<any>typedVals[0].year instanceof Date, true)
  equal(moment(typedVals[0].year).format("YYYY"), "1941")
}

testTree.pivotTable = equal => {
  // Arrange
  const data = jtree.Utils.javascriptTableWithHeaderRowToObjects(DummyDataSets.patients)
  const table = new Table(data)

  // Act
  const newTable = table.makePivotTable(
    ["Gender"],
    [
      {
        source: "Weight",
        reduction: "sum",
        name: "totalSum"
      }
    ]
  )
  const newColumn = newTable.getColumnByName("totalSum")

  // Assert
  equal(newColumn.getValues()[0], 8.61)
  equal(newColumn.getValues()[1], 6.5)
}

testTree.filterTest = equal => {
  // Arrange
  const data = jtree.Utils.javascriptTableWithHeaderRowToObjects(DummyDataSets.waterBill)
  const table = new Table(data, [{ source: "PaidOn", name: "year", type: "year" }])

  // Assert
  equal(table.getTableColumnByName("year").getReductions().count, 16, "expected rows")
  // Act
  const newTable = table.filterClonedRowsByScalar("year", ComparisonOperators.greaterThan, "2018")
  // Assert
  equal(newTable.getRowCount(), 3, "rows filtered")
  equal(newTable.getTableColumnByName("year").getReductions().count, 3, "reductions should be correct")
}

testTree.timeTest = equal => {
  // Arrange
  const rows = [["time"], [1535482671], [1534034894], [1533851918], [1531158072], [1520274393], [1514831947], [1512006781], [1511556916]]
  const table = new Table(jtree.Utils.javascriptTableWithHeaderRowToObjects(rows))
  const typedVals = table.getJavascriptNativeTypedValues()
  const column = table.getColumnByName("time")

  // Assert
  equal(column.getPrimitiveTypeName(), "second")
}

/*NODE_JS_ONLY*/ if (!module.parent) jtree.TestRacer.testSingleFile(__filename, testTree)
export { testTree }
