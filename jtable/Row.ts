//onsave jtree build produce jtable.browser.js
//onsave jtree build produce jtable.node.js

const { jtree } = require("../index.js")

import { jTableTypes } from "../products/jTableTypes"
import { Column } from "./Column"

/*FOR_TYPES_ONLY*/ import { Table } from "./Table"

class Row {
  constructor(sourceObject = {}, table: any) {
    this._puid = this._getUniqueId()
    this._sourceObject = sourceObject
    this._table = table
  }

  private _puid: number
  private _sourceObject: jTableTypes.sourceObject
  private _table: Table
  private _objectWithOnlyNativeJavascriptTypes: jTableTypes.objectWithOnlyNativeJavascriptTypes
  private static _uniqueId = 0

  _getUniqueId() {
    Row._uniqueId++
    return Row._uniqueId
  }

  destroy() {}

  async destroyRow() {}

  getAsArray(headerRow: string[]) {
    const obj = this.rowToObjectWithOnlyNativeJavascriptTypes()
    return headerRow.map(col => obj[col])
  }

  getRowSourceObject() {
    return this._sourceObject
  }

  toVector() {
    return Object.values(this.rowToObjectWithOnlyNativeJavascriptTypes())
  }

  // todo: rowToObjectWithOnlyNativeJavascriptTypes method? Its numerics where we need and strings where we need.
  private _parseIntoObjectWithOnlyNativeJavascriptTypes() {
    const columns = this._table.getColumnsMap()
    const typedNode: any = {}
    Object.keys(columns).forEach(colName => {
      typedNode[colName] = this._getRowValueFromSourceColOrOriginalCol(colName)
    })
    return typedNode
  }

  // why from source col? if we always copy, we shouldnt need that, correct? perhaps have an audit array of all operations on a row?
  private _getRowValueFromSourceColOrOriginalCol(colName: string) {
    const columns = this._table.getColumnsMap()
    const destColumn = columns[colName]
    const sourceColName = destColumn._getSourceColumnName()
    const sourceCol = columns[sourceColName]

    // only use source if we still have access to it
    const val = sourceColName && sourceCol ? this._getRowValueFromOriginalOrSource(sourceColName, sourceCol.getPrimitiveTypeName(), destColumn.getPrimitiveTypeName()) : this.getRowOriginalValue(colName)

    const res = destColumn.getPrimitiveTypeObj().getAsNativeJavascriptType(val)
    const mathFn = destColumn.getMathFn()
    if (mathFn) return mathFn(res)
    return res
  }

  private _getRowValueFromOriginalOrSource(sourceColName: jTableTypes.columnName, sourceColType: jTableTypes.primitiveType, destType: jTableTypes.primitiveType) {
    return Column.convertValueToNumeric(this.getRowOriginalValue(sourceColName), sourceColType, destType)
  }

  rowToObjectWithOnlyNativeJavascriptTypes() {
    if (!this._objectWithOnlyNativeJavascriptTypes) this._objectWithOnlyNativeJavascriptTypes = this._parseIntoObjectWithOnlyNativeJavascriptTypes()
    return this._objectWithOnlyNativeJavascriptTypes
  }

  getRowKeys() {
    return Object.keys(this.getRowSourceObject())
  }

  getFirstValue() {
    return this.getRowOriginalValue(this.getRowKeys()[0])
  }

  // todo: get values from source/virtual columns
  getRowOriginalValue(column: jTableTypes.columnName): string | any {
    const value = this.getRowSourceObject()[column]
    return value === null ? "" : value
  }

  getRowHtmlSafeValue(columnName: jTableTypes.columnName) {
    const val = this.getRowOriginalValue(columnName)
    return val === undefined ? "" : jtree.Utils.stripHtml(val.toString()).toString() // todo: cache this?
  }

  getHoverTitle() {
    return encodeURIComponent(this.rowToString().replace(/\n/g, " "))
  }

  getPuid() {
    return this._puid
  }

  rowToString() {
    return JSON.stringify(this.getRowSourceObject(), null, 2)
  }
}

export { Row }
