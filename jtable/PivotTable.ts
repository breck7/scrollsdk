import { jTableTypes } from "../worldWideTypes/JTableTypes"

class PivotTable {
  constructor(
    rows: jTableTypes.objectWithOnlyNativeJavascriptTypes[],
    inputColumns: jTableTypes.columnDefinitionObject[],
    outputColumns: jTableTypes.columnDefinitionObject[]
  ) {
    this._rows = rows
    inputColumns.forEach(col => (this._columns[col.name] = col))
    outputColumns.forEach(col => (this._columns[col.name] = col))
  }

  private _rows: jTableTypes.objectWithOnlyNativeJavascriptTypes[]
  private _columns: { [columnName: string]: jTableTypes.columnDefinitionObject } = {}

  _getGroups(allRows, groupByColNames: jTableTypes.columnName[]) {
    const rowsInGroups = new Map()
    allRows.forEach((row: any) => {
      const groupKey = groupByColNames.map(col => row[col].toString().replace(/ /g, "")).join(" ")
      if (!rowsInGroups.has(groupKey)) rowsInGroups.set(groupKey, [])
      rowsInGroups.get(groupKey).push(row)
    })
    return rowsInGroups
  }

  getNewRows(groupByCols: jTableTypes.columnName[]) {
    // make new trees
    const rowsInGroups = this._getGroups(this._rows, groupByCols)

    // Any column in the group should be reused by the children
    const columns = [
      <jTableTypes.columnDefinitionObject>{
        name: "count",
        type: "number",
        min: 0
      }
    ]

    groupByCols.forEach(colName => columns.push(this._columns[colName]))
    const colsToReduce = Object.values(this._columns).filter(col => !!col.reduction)
    colsToReduce.forEach(col => columns.push(col))

    // for each group
    const newRows = []
    const totalGroups = rowsInGroups.size
    for (let [groupId, group] of rowsInGroups) {
      const firstRow = group[0]
      const newRow: jTableTypes.sourceObject = {}
      groupByCols.forEach(col => {
        newRow[col] = firstRow ? firstRow[col] : 0
      })
      newRow.count = group.length

      // todo: add more reductions? count, stddev, median, variance.
      colsToReduce.forEach(col => {
        const sourceColName = col.source
        const values = group.map((row: any) => row[sourceColName]).filter(val => typeof val === "number" && !isNaN(val))
        const reduction = col.reduction
        let reducedValue = firstRow[sourceColName]

        if (reduction === "sum") reducedValue = values.reduce((prev, current) => prev + current, 0)
        if (reduction === "max") reducedValue = Math.max(...values)
        if (reduction === "min") reducedValue = Math.min(...values)
        if (reduction === "mean") reducedValue = values.reduce((prev, current) => prev + current, 0) / values.length

        newRow[col.name] = reducedValue
      })

      newRows.push(newRow)
    }

    return {
      rows: newRows,
      columns: columns
    }
  }
}

export { PivotTable }
