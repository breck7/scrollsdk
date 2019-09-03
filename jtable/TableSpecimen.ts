import { jTableTypes } from "../worldWideTypes/JTableTypes"

class TableSpecimen {
  constructor(columns: string[], rows: string[]) {
    this.colCount = columns.length
    this.rowCount = rows.length
    this.timeseries = false
    this.primaryKey = false
    this.nounType = "thing"
    this.nounClasses = "someGeneralThing someMoreSpecificThing"
    this.hasNumericCol = false
    this.hasDateCol = false
    this.hasNominalCol = false
    this.rowNounType = "" // are these presidents, page views, transactions, et cetera
    this.hasSubNounColumn = false // a table can contain mixed cousin types, such as withdrawals/deposits.
    this.subNounColumns = []
    this.correlationMatrx = [] // correlations for every column
    this.mostImportantColumns = [] // columns ranked by importance.
    this.isOrderImportant = false // does the row order carry meaning that we should preserve?
    this.hasRankColumn = false // is there a column like first place, second place, third place....
    this.hasFrequencyColumn = false // is there a column that indicates frequency?
    this.hasSlice = false // whether one column represents the "part" of the "whole", good for slice charts like pies.
    this.cohesivity = 1 // 3 dog rows > cohesivity than 2 dog rows 1 cat row > cohesivity than 1 dog row, 1 cat row, 1 soda row.
    this.isPair = false // pairs breck:32 mike:31 sam:1
  }

  public colCount: jTableTypes.int
  public rowCount: jTableTypes.int
  public timeseries: boolean
  public primaryKey: boolean
  public nounType: jTableTypes.nounType
  public nounClasses: jTableTypes.nounClasses
  public hasNumericCol: boolean
  public hasDateCol: boolean
  public hasNominalCol: boolean
  public rowNounType: jTableTypes.nounType
  public hasSubNounColumn: boolean
  public subNounColumns: any[]
  public correlationMatrx: []
  public mostImportantColumns: []
  public isOrderImportant: boolean
  public hasRankColumn: boolean
  public hasFrequencyColumn: boolean
  public hasSlice: boolean
  public cohesivity: number
  public isPair: boolean
}

export { TableSpecimen }
