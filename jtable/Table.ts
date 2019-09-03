const { jtree } = require("../products/jtree.node.js")

import { jTableTypes } from "../worldWideTypes/JTableTypes"
import { Row } from "./Row"
import { Column } from "./Column"
import { PivotTable } from "./PivotTable"

import { ComparisonOperators } from "./JTableConstants"

declare type columnsMap = { [columnName: string]: Column }

// todo: remove detectAndAddParam?
// todo: remove rowclass param?
class Table {
  constructor(
    rowsArray: (Row | jTableTypes.rawRowJavascriptObject)[] = [],
    columnsArrayOrMap: jTableTypes.columnDefinitionObject[] | columnsMap = [],
    rowClass = Row,
    detectAndAddColumns = true
  ) {
    this._ctime = new jtree.TreeNode()._getProcessTimeInMilliseconds()
    this._tableId = this._getUniqueId()

    // if this is ALREADY CARDS, should we be a view?
    this._rows = rowsArray.map(source => (source instanceof Row ? source : new rowClass(source, this)))

    // Add detected columns first, so they can be overwritten
    if (detectAndAddColumns) this._getDetectedColumnNames().forEach(col => this._registerColumn({ name: col }))

    if (Array.isArray(columnsArrayOrMap)) columnsArrayOrMap.forEach(col => this._registerColumn(col))
    else if (columnsArrayOrMap) this._columnsMap = columnsArrayOrMap
  }

  private static _uniqueId = 0

  _getUniqueId() {
    Table._uniqueId++
    return Table._uniqueId
  }

  private _tableId: number
  private _rows: Row[]
  private _sampleSet: Row[]
  private _ctime: jTableTypes.now
  private _columnsMap: columnsMap = {}

  private _registerColumn(col) {
    this._columnsMap[col.name] = new Column(col, this._getColumnValuesFromSourceAsAnyVector(col.name))
    return this
  }

  private _getColumnValuesFromSourceAsAnyVector(columnName: jTableTypes.columnName) {
    return this.getRows().map((row: any) => row.getRowOriginalValue(columnName))
  }

  // todo: ADD TYPINGS
  private _predictColumns(predictionHints: jTableTypes.predictionHintsString, propertyNameToColumnNameMap: jTableTypes.propertyNameToColumnNameMap = {}) {
    // todo: use the available input table column names, coupled with column setting we are trying to predict.
    // ie: "gender" should use "gender" col, if available

    // check all the columns for one that matches all tests. if found, return it.
    const columnsArray = this.getColumnsArray()
    const tests = predictionHints.split(",")

    const filterTests = tests.filter(test => test.includes("=")).map(test => test.split("="))
    const filterFn = col => filterTests.every(test => col[test[0]] !== undefined && col[test[0]]().toString() === test[1])
    let colsThatPassed = columnsArray.filter(col => filterFn(col))

    const notIn: any = {}
    const notEqualTests = tests
      .filter(test => test.startsWith("!"))
      .map(test => propertyNameToColumnNameMap[test.substr(1)])
      .filter(i => i)
      .forEach(name => {
        notIn[name] = true
      })
    colsThatPassed = colsThatPassed.filter((col: any) => !notIn[col.getColumnName()])

    // for now just 1 prop ranking.
    const rankColumn = tests.find(test => !test.includes("=") && !test.includes("!"))
    let potentialCols = colsThatPassed

    if (rankColumn) potentialCols = <Column[]>potentialCols.sort(jtree.Utils.makeSortByFn((col: any) => col[rankColumn]())).reverse()

    return potentialCols
  }

  getRows() {
    return this._rows
  }

  getFirstColumnAsString() {
    return this.getRows()
      .map((row: any) => row.getFirstValue())
      .join("")
  }

  isBlankTable() {
    return this.getRowCount() === 0 && this.getColumnCount() === 0
  }
  getRowCount() {
    return this.getRows().length
  }

  getColumnCount() {
    return this.getColumnNames().length
  }

  getColumnNames() {
    return Object.keys(this.getColumnsMap())
  }

  getColumnsMap() {
    return this._columnsMap
  }

  getColumnByName(name) {
    return this.getColumnsMap()[name]
  }

  private _getLowerCaseColumnsMap() {
    const map = {}
    Object.keys(this._columnsMap).forEach(key => (map[key.toLowerCase()] = key))
    return map
  }

  getTableCTime() {
    return this._ctime
  }

  filterClonedRowsByScalar(columnName: jTableTypes.columnName, comparisonOperator: ComparisonOperators, scalarValueAsString: string): Table {
    const column = this.getColumnByName(columnName)
    let typedScalarValue = column.getPrimitiveTypeObj().getAsNativeJavascriptType(scalarValueAsString)
    if (typedScalarValue instanceof Date) typedScalarValue = typedScalarValue.getTime() // todo: do I need this?

    return new Table(
      this.cloneNativeJavascriptTypedRows().filter((row: any) => {
        let rowTypedValue = row[columnName]
        if (rowTypedValue instanceof Date) rowTypedValue = rowTypedValue.getTime() // todo: do I need this?

        if (comparisonOperator === ComparisonOperators.equal) return rowTypedValue == typedScalarValue
        if (comparisonOperator === ComparisonOperators.notEqual) return rowTypedValue != typedScalarValue
        if (comparisonOperator === ComparisonOperators.greaterThan) return rowTypedValue > typedScalarValue
        if (comparisonOperator === ComparisonOperators.lessThan) return rowTypedValue < typedScalarValue
        if (comparisonOperator === ComparisonOperators.lessThanOrEqual) return rowTypedValue <= typedScalarValue
        if (comparisonOperator === ComparisonOperators.greaterThanOrEqual) return rowTypedValue >= typedScalarValue
      }),
      this.getColumnsMap(),
      undefined,
      false
    )
  }

  getColumnsArray() {
    return Object.values(this.getColumnsMap())
  }

  getColumnsArrayOfObjects() {
    return this.getColumnsArray().map(col => col.toObject())
  }

  getJavascriptNativeTypedValues(): jTableTypes.objectWithOnlyNativeJavascriptTypes[] {
    return this.getRows().map((row: any) => row.rowToObjectWithOnlyNativeJavascriptTypes())
  }

  clone() {
    return new Table(this.cloneNativeJavascriptTypedRows())
  }

  cloneNativeJavascriptTypedRows() {
    return this.getRows()
      .map((row: any) => row.rowToObjectWithOnlyNativeJavascriptTypes())
      .map(obj => Object.assign({}, obj))
  }

  getTableColumnByName(name) {
    return this.getColumnsMap()[name]
  }

  private _getUnionSample(sampleSet: Row[]) {
    const sample = {}
    sampleSet.forEach((row: any) => {
      row.getRowKeys().forEach(key => {
        if (!key) return
        const currentVal = sample[key]
        if (currentVal !== undefined && currentVal !== "") return
        sample[key] = row.getRowOriginalValue(key)
      })
    })
    return sample
  }

  private _getSampleSet() {
    const SAMPLE_SET_SIZE = 30 // todo: fix.
    if (!this._sampleSet) this._sampleSet = jtree.Utils.sampleWithoutReplacement(this.getRows(), SAMPLE_SET_SIZE, Date.now())
    return this._sampleSet
  }

  private _getDetectedColumnNames(): jTableTypes.columnName[] {
    const columns = this.getColumnsMap()
    // This is run AFTER we have all user definied columns, and AFTER we have all data.
    // detect columns that appear in records
    // todo: this is broken. if you only pull 30, and its a tree or other type with varying columsn, you
    // will often miss columns.
    return Object.keys(this._getUnionSample(this._getSampleSet()))
      .map(columnName => columnName.trim()) // todo: why do we filter empties?
      .filter(col => col)
      .filter(col => !columns[col]) // do not overwrite any custom columns
  }

  toTypeScriptInterface() {
    const cols = this.getColumnsArray()
      .map(col => `  ${col.getColumnName()}: ${col.getPrimitiveTypeName()};`)
      .join("\n")
    return `interface Row {
${cols}
}`
  }

  getColumnNamesAndTypes() {
    return this._getColumnNamesAndTypes()
  }

  getColumnNamesAndTypesAndReductions() {
    return this._getColumnNamesAndTypes(true)
  }

  private _getColumnNamesAndTypes(withReductions = false) {
    const columns = this.getColumnsMap()
    return this.getColumnNames().map(name => {
      const column = columns[name]
      const obj = {
        Column: name,
        JTableType: column.getPrimitiveTypeName(),
        JavascriptType: column.getPrimitiveTypeObj().getJavascriptTypeName()
      }
      if (withReductions) Object.assign(obj, column.getReductions())
      return obj
    })
  }

  getPredictionsForAPropertyNameToColumnNameMapGivenHintsNode(
    hintsNode: jTableTypes.treeNode,
    propertyNameToColumnNameMap: jTableTypes.propertyNameToColumnNameMap
  ): jTableTypes.propertyNameToColumnNameMap {
    const results: jTableTypes.propertyNameToColumnNameMap = {}
    hintsNode
      .map(columnHintNode => this.getColumnNamePredictionsForProperty(columnHintNode.getFirstWord(), columnHintNode.getContent(), propertyNameToColumnNameMap))
      .filter(pred => pred.length)
      .forEach(predictions => {
        const topPrediction = predictions[0]
        results[topPrediction.propertyName] = topPrediction.columnName
      })

    return results
  }

  getColumnNamePredictionsForProperty(
    propertyName: string,
    predictionHints: jTableTypes.predictionHintsString,
    propertyNameToColumnNameMap: jTableTypes.propertyNameToColumnNameMap
  ): jTableTypes.columnNamePrediction[] {
    const userDefinedColumnName: jTableTypes.columnName = propertyNameToColumnNameMap[propertyName]

    if (this.getColumnsMap()[userDefinedColumnName]) return [{ propertyName: propertyName, columnName: userDefinedColumnName }] // Table has a column named this, return okay.

    // Table has a lowercase column named this. Return okay. Todo: do we want to do this?
    if (userDefinedColumnName && this._getLowerCaseColumnsMap()[userDefinedColumnName.toLowerCase()])
      return [this._getLowerCaseColumnsMap()[userDefinedColumnName.toLowerCase()]]

    if (predictionHints) {
      const potentialCols = this._predictColumns(predictionHints, propertyNameToColumnNameMap)
      if (potentialCols.length) return [{ propertyName: propertyName, columnName: potentialCols[0].getColumnName() }]
    }

    const cols = this.getColumnsByImportance()
    const name = cols.length && cols[0].getColumnName()
    if (name) return [{ propertyName: propertyName, columnName: name }]
    return []
  }

  toTree() {
    return new jtree.TreeNode(this.getRows().map((row: any) => row.getRowSourceObject()))
  }

  filterRowsByFn(fn: Function) {
    return new Table(this.cloneNativeJavascriptTypedRows().filter((inputRow, index) => fn(inputRow, index)))
  }

  // todo: make more efficient?
  // todo: preserve columns
  addColumns(columnsToAdd: jTableTypes.columnDefinitionObject[]): Table {
    const inputColDefs = this.getColumnsMap()
    return new Table(
      this.cloneNativeJavascriptTypedRows().map(inputRow => {
        columnsToAdd.forEach(newCol => {
          let newValue
          if (newCol.accessorFn) newValue = newCol.accessorFn(inputRow)
          else newValue = Column.convertValueToNumeric(inputRow[newCol.source], inputColDefs[newCol.source].getPrimitiveTypeName(), newCol.type, newCol.mathFn)
          inputRow[newCol.name] = newValue
        })
        return inputRow
      })
    )
  }

  // todo: can be made more effcicent
  changeColumnType(columnName: jTableTypes.columnName, newType: jTableTypes.primitiveType) {
    const cols = this.getColumnsArrayOfObjects()
    cols.forEach(col => {
      if (col.name === columnName) col.type = newType
    })
    return new Table(this.cloneNativeJavascriptTypedRows(), cols, undefined, false)
  }

  // todo: can be made more effcicent
  dropAllColumnsExcept(columnsToKeep: jTableTypes.columnName[]): Table {
    return new Table(
      this.cloneNativeJavascriptTypedRows().map((inputRow, rowIndex) => {
        const result = {}
        columnsToKeep.forEach(name => {
          result[name] = inputRow[name]
        })
        return result
      }),
      columnsToKeep.map(colName => this.getColumnByName(colName).toObject())
    )
  }

  // todo: we don't need any cloning here--just create a new row, new rows array, new and add the pointers
  // to same rows
  addRow(rowWords: string[]) {
    const rows = this.cloneNativeJavascriptTypedRows()
    const newRow = {}
    Object.keys(rows[0] || {}).forEach((key, index) => {
      // todo: handle typings
      newRow[key] = rowWords[index]
    })
    rows.push(newRow)
    return new Table(rows, this.getColumnsMap())
  }

  // todo: we don't need any cloning here--here create a new sorted array with poitners
  // to same rows
  shuffleRows() {
    // todo: add seed!
    // cellType randomSeed int
    //  description An integer to seed the random number generator with.
    return new Table(jtree.Utils.shuffleInPlace(this.getRows().slice(0)), this.getColumnsMap())
  }

  reverseRows() {
    const rows = this.getRows().slice(0)
    rows.reverse()
    return new Table(rows, this.getColumnsMap())
  }

  // Pivot is shorthand for group and reduce?
  makePivotTable(groupByColumnNames: jTableTypes.columnName[], newCols: jTableTypes.columnDefinitionObject[]) {
    const inputColumns = this.getColumnsArrayOfObjects()
    const colMap = {}
    inputColumns.forEach(col => (colMap[col.name] = true))
    const groupByCols = groupByColumnNames.filter(col => colMap[col])

    const pivotTable = new PivotTable(this.getJavascriptNativeTypedValues(), inputColumns, newCols).getNewRows(groupByCols)
    return new Table(pivotTable.rows, pivotTable.columns)
  }

  sortBy(colNames: jTableTypes.columnName[]) {
    const colAccessorFns = colNames.map((colName: string) => (row: any) => row.rowToObjectWithOnlyNativeJavascriptTypes()[colName])
    const rows = this.getRows().sort(jtree.Utils.makeSortByFn(colAccessorFns))
    return new Table(rows, this.getColumnsMap())
  }

  toDelimited(delimiter: string) {
    return this.toTree().toDelimited(delimiter, this.getColumnNames())
  }

  // guess which are the more important/informative/interesting columns
  getColumnsByImportance() {
    const columnsMap = this.getColumnsMap()
    const aIsMoreImportant = -1
    const bIsMoreImportant = 1
    const cols = Object.keys(columnsMap).map(columnName => columnsMap[columnName])
    cols.sort((colA, colB) => {
      if (colA.getTitlePotential() > colB.getTitlePotential()) return aIsMoreImportant
      if (colB.getTitlePotential() > colA.getTitlePotential()) return bIsMoreImportant
      if (colA.getBlankPercentage() > 0.5 || colB.getBlankPercentage() > 0.5) {
        if (colA.getBlankPercentage() > colB.getBlankPercentage()) return bIsMoreImportant
        else if (colB.getBlankPercentage() > colA.getBlankPercentage()) return aIsMoreImportant
      }
      if (colA.isTemporal() && !colB.isTemporal()) return aIsMoreImportant
      if (!colA.isTemporal() && colB.isTemporal()) return bIsMoreImportant
      if (colA.isLink() && !colB.isLink()) return bIsMoreImportant
      else if (!colA.isLink() && colB.isLink()) return aIsMoreImportant
      if (colA.isString() && !colB.isString()) return bIsMoreImportant
      else if (!colA.isString() && colB.isString()) return aIsMoreImportant
      if (colA.isString() && colB.isString()) {
        if (colA.getEntropy() > 4 && colA.getEntropy() < 8 && colA.getEntropy() > colB.getEntropy()) return aIsMoreImportant
        if (colA.getEstimatedTextLength() > colB.getEstimatedTextLength()) return bIsMoreImportant
        else return aIsMoreImportant
      }
      return 0
    })
    return cols
  }

  // todo: add toProtoBuff
}

export { Table }
