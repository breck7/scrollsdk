const { jtree } = require("../index.js")

import { jTableTypes } from "../worldWideTypes/JTableTypes"

import {
  AbstractPrimitiveType,
  BooleanType,
  ObjectType,
  USD,
  NumberCol,
  NumberString,
  Feet,
  IntType,
  UrlCol,
  HTMLCol,
  DirCol,
  PathCol,
  TextCol,
  StringCol,
  AbstractTemporal,
  MilliSecond,
  Second,
  DateCol,
  Day,
  Month,
  MonthDay,
  Week,
  Hour,
  Minute,
  Year,
  HourMinute,
  CodeCol
} from "./Primitives"

// todo: ADD TYPINGS
class Column {
  constructor(colDef: jTableTypes.columnDefinitionObject = {}, rawAnyVector: any[]) {
    this._colDefObject = colDef
    this._rawAnyVectorFromSource = rawAnyVector
    this._sampleSet = jtree.Utils.sampleWithoutReplacement(rawAnyVector, 30, Date.now())
  }

  private _colDefObject: jTableTypes.columnDefinitionObject
  private _rawAnyVectorFromSource: any[]
  private _sampleSet: any[]
  private _sample: any
  private _type: AbstractPrimitiveType
  private _entropy: jTableTypes.entropy
  private _isLink: boolean
  private _estimatedTextLength: number
  private _titlePotential: jTableTypes.float
  private _map: jTableTypes.countMap
  private _summaryVector: jTableTypes.summaryVector
  private _reductions: jTableTypes.reductionResult

  private static _colTypes: { [typeName: string]: AbstractPrimitiveType }

  private static _getPrimitiveTypesCollection() {
    if (!this._colTypes)
      this._colTypes = {
        millisecond: new MilliSecond("millisecond"),
        second: new Second("second"),
        date: new DateCol("date"),
        day: new Day("day"),
        week: new Week("week"),
        month: new Month("month"),
        monthDay: new MonthDay("monthDay"),
        hour: new Hour("hour"),
        hourMinute: new HourMinute("hourMinute"),
        minute: new Minute("minute"),
        year: new Year("year"),
        feet: new Feet("feet"),
        usd: new USD("usd"),
        number: new NumberCol("number"),
        numberString: new NumberString("numberString"),
        string: new StringCol("string"),
        text: new TextCol("text"),
        path: new PathCol("path"),
        dir: new DirCol("dir"),
        code: new CodeCol("code"),
        html: new HTMLCol("html"),
        url: new UrlCol("url"),
        object: new ObjectType("object"),
        boolean: new BooleanType("boolean"),
        int: new IntType("int")
      }
    return this._colTypes
  }

  static getPrimitiveTypeByName(name: string) {
    return this._getPrimitiveTypesCollection()[name]
  }

  getMathFn() {
    return this._colDefObject.mathFn
  }

  getColumnName() {
    return this._getColDefObject().name
  }

  getSourceColumnName() {
    return this._colDefObject.source
  }

  isInvalidValue(value: any) {
    return this.getPrimitiveTypeObj().isInvalidValue(value)
  }

  private _getSample() {
    if (this._sample === undefined) {
      const sampleSet = this._getSampleSet()
      this._sample = sampleSet.length ? sampleSet[0] : ""
    }
    return this._sample
  }

  private _getColDefObject() {
    return this._colDefObject
  }

  getPrimitiveTypeObj() {
    if (!this._type) this._type = this._inferType()
    return this._type
  }

  isTemporal() {
    return this.getPrimitiveTypeObj().isTemporal()
  }

  toDisplayString(value: any) {
    return this.getPrimitiveTypeObj().toDisplayString(value, this.getFormat())
  }

  isString() {
    return this.getPrimitiveTypeObj().isString()
  }

  isNumeric() {
    return this.getPrimitiveTypeObj().isNumeric()
  }

  isHash() {
    return this.isString() && false // todo: make this work. identify random hashes, et cetera.
  }
  // todo: isEnum/isSet
  // todo: isUniqueTimestamp

  getEntropy() {
    if (this._entropy !== undefined) return this._entropy
    const possibilities: any = {}
    let bits = 1
    const name = this.getColumnName()
    this._getSampleSet().forEach(val => {
      if (possibilities[val]) return
      bits++
      possibilities[val] = true
    })
    this._entropy = bits
    return this._entropy
  }

  isLink() {
    if (this._isLink !== undefined) return this._isLink
    const sample = this._getSample()
    if (!this.isString() || !sample || !sample.match) this._isLink = false
    else this._isLink = sample.match(/^(https?\:|\/)/) ? true : false
    return this._isLink
  }

  _getSampleSet() {
    return this._sampleSet
  }

  isUnique() {
    return this.getEntropy() - 1 === this._getSampleSet().length
  }

  getTitlePotential() {
    if (this._getColDefObject().title) return 1
    if (this._titlePotential !== undefined) return this._titlePotential
    const titleCols: any = {
      title: 0.99,
      name: 0.98,
      label: 0.97,
      category: 0.96
    }
    const lowerCaseName = this.getColumnName().toLowerCase()
    if (titleCols[lowerCaseName]) this._titlePotential = titleCols[lowerCaseName]
    else if (this.getEstimatedTextLength() > 150) this._titlePotential = 0.01
    else if (this.isString() && !this.isLink() && this.isUnique() && !this.isHash()) this._titlePotential = 0.75
    else this._titlePotential = 0
    return this._titlePotential
  }

  getVegaType() {
    return this.getPrimitiveTypeObj().getVegaType()
  }

  getVegaTimeUnit() {
    const type = <AbstractTemporal>this.getPrimitiveTypeObj()
    return type.getVegaTimeUnit ? type.getVegaTimeUnit() : undefined
  }

  getEstimatedTextLength() {
    if (!this.isString()) return 0
    if (this._estimatedTextLength !== undefined) return this._estimatedTextLength
    const name = this.getColumnName()
    const sampleSet = this._getSampleSet()
    const sum = sampleSet.map(val => val && val.length).reduce((rowLength, cumulative) => rowLength + cumulative, 0)
    this._estimatedTextLength = Math.floor(sum / sampleSet.length)
    return this._estimatedTextLength
  }

  getFormat() {
    if (this._getColDefObject().format) return this._getColDefObject().format
    return this.getPrimitiveTypeObj().getDefaultFormat(this.getColumnName(), this._getSample())
  }

  getBlankPercentage() {
    let blankCount = 0
    let mistypedCount = 0 // todo.
    const colName = this.getColumnName()
    const sampleSet = this._getSampleSet()
    sampleSet.forEach(value => {
      if (value === undefined || value === "") blankCount++
      // todo: add mistyped data
    })
    return blankCount / (sampleSet.length || 1)
  }

  getMap() {
    const map = this._map
    if (map) return map
    this._map = this._getSummaryVector().map
    return this._map
  }

  private _getSummaryVector() {
    if (!this._summaryVector) this._summaryVector = this._createSummaryVector()
    return this._summaryVector
  }

  private _getRawAnyVectorFromSource() {
    return this._rawAnyVectorFromSource
  }

  private _createSummaryVector(): jTableTypes.summaryVector {
    const values: any = []
    const name = this.getColumnName()
    const map = new Map()
    let incompleteCount = 0
    let uniques = 0
    let index = 0

    let rawVector = this._getRawAnyVectorFromSource()

    // If needs conversion.
    // todo: add tests
    const primitiveType = this.getPrimitiveTypeObj()
    if (primitiveType.isNumeric() && typeof rawVector[0] === "string") rawVector = rawVector.map(primitiveType.fromStringToNumeric)

    rawVector.forEach(val => {
      if (this.isInvalidValue(val)) {
        incompleteCount++
        return true
      }
      if (!map.has(val)) {
        map.set(val, { count: 0, index: index })
        uniques++
      } else map.get(val).count++
      values.push(val)
    })

    return {
      map: map,
      values: values,
      incompleteCount: incompleteCount,
      uniqueValues: uniques
    }
  }

  getQuins() {
    const deciles = this.getReductions().deciles
    return [20, 40, 60, 80, 100].map(decile => {
      return {
        value: deciles[decile],
        percent: decile / 100
      }
    })
  }

  getPrimitiveTypeName(): jTableTypes.primitiveType {
    return this.getPrimitiveTypeObj().getPrimitiveTypeName()
  }

  toObject(): jTableTypes.columnDefinitionObject {
    return {
      name: this.getColumnName(),
      type: this.getPrimitiveTypeName(),
      vegaType: this.getVegaType(),
      vegaTimeUnit: this.getVegaTimeUnit(),
      reduction: this._getColDefObject().reduction,
      titlePotential: this.getTitlePotential(),
      isString: this.isString(),
      isTemporal: this.isTemporal(),
      isLink: this.isLink(),
      estimatedTextLength: this.getEstimatedTextLength()
    }
  }

  getReductions() {
    if (!this._reductions) this._reductions = this._getReductionResult(this._getSummaryVector(), this)

    return this._reductions
  }

  getMax() {
    return this.getReductions().max
  }

  getMean() {
    return this.getReductions().mean
  }

  private _getReductionResult(valuesObj: jTableTypes.summaryVector, col: any) {
    const values = valuesObj.values
    const count = values.length
    const reductionResult: jTableTypes.reductionResult = {}
    reductionResult.incompleteCount = valuesObj.incompleteCount
    reductionResult.uniqueValues = valuesObj.uniqueValues
    if (!count) return reductionResult

    const numericCompare = (av: number, bv: number) => (av > bv ? 1 : av < bv ? -1 : 0)

    const arr = values.slice()
    col.isString() ? arr.sort() : arr.sort(numericCompare)

    let min = arr[0]
    let max = arr[0]
    let sum = 0
    let mode = undefined
    let modeSize = 0
    let currentBucketValue = undefined
    let currentBucketSize = 0
    for (let index = 0; index < count; index++) {
      let value = arr[index]
      sum += value
      if (value > max) max = value
      if (value < min) min = value
      if (value === currentBucketValue) currentBucketSize++
      else {
        currentBucketValue = value
        currentBucketSize = 1
      }
      if (currentBucketSize > modeSize) {
        modeSize = currentBucketSize
        mode = currentBucketValue
      }
    }

    const medianIndex = Math.floor(count / 2)
    reductionResult.count = count
    reductionResult.sum = sum
    reductionResult.median = arr[medianIndex]
    reductionResult.mean = sum / count
    reductionResult.min = min
    reductionResult.max = max
    reductionResult.range = max - min
    reductionResult.mode = mode
    reductionResult.modeSize = modeSize
    if (col.isString()) {
      reductionResult.sum = undefined
      reductionResult.mean = undefined
    } else if (col.isTemporal()) reductionResult.sum = undefined

    reductionResult.deciles = {}
    const deciles = [10, 20, 30, 40, 50, 60, 70, 80, 90, 99, 100]
    deciles.forEach(decile => {
      let index = Math.floor(count * (decile / 100))
      index = index === count ? index - 1 : index
      reductionResult.deciles[decile] = arr[index]
    })

    return reductionResult
  }

  static _getColumnProbabilities(name: string, sample: any) {
    // Assume data is trimmed.
    const sampleType = typeof sample
    const sampleStringLength = sample !== undefined ? sample.toString().length : 0
    const guesses: jTableTypes.primitiveTypeGuess = {}
    guesses.number = 0.5
    guesses.date = 0.25
    guesses.string = 0.75
    guesses.feet = 0.01 // 5'11"
    guesses.object = 0.1
    guesses.boolean = 0.02
    const isDate = sample instanceof Date
    const isNumber = !isNaN(parseFloat(sample)) || Column.getPrimitiveTypeByName("usd").getProbForColumnSpecimen(sample)

    if (sampleType === "object") guesses.object = 0.9
    if (sample === true || sample === false) guesses.boolean = 0.96

    if (name.match(/(team|name|link|image|description|permalink|title|label|status|thumb|ip|useragent)/i)) guesses.string = 0.95

    if (name.match(/(gender|region|category|group|section|sector|field)/i)) guesses.string = 0.95

    if (name.match(/(height|length)/i)) {
      if (sample.toString().match(/[0-9]+(\'|\-)[0-9\.]+/) && Column.getPrimitiveTypeByName("feet").getProbForColumnSpecimen(sample)) guesses.feet = 0.97
    }

    if (isNumber) guesses.number = 0.8
    else guesses.number = 0.1

    const usdGuess = Column.getPrimitiveTypeByName("usd").getProbForColumnSpecimen(sample)
    if (usdGuess || (!isNaN(sample) && name.match(/^(price|income|cost|revenue|budget|profit|amount|balance)$/i))) guesses.usd = 0.99

    if (isNumber && name.match(/(year|born)/i) && sampleStringLength === 4) guesses.year = 0.99

    if (isDate && name.match(/(year|born)/i)) guesses.year = 0.99

    if (isNumber && name.match(/(time|second|created|edited)/i) && sampleStringLength === 10) guesses.second = 0.99

    if (isNumber && name.match(/(time|second)/i) && sampleStringLength === 13) guesses.millisecond = 0.99

    const isValidDate = Column.getPrimitiveTypeByName("date").getProbForColumnSpecimen(sample)
    if (name.match(/(year|date|dob|birthday|day|month|time|birthdate|utc)/i) && isValidDate) guesses.date = 0.98
    else if (isValidDate && sampleType === "string" && sample.includes("/")) guesses.date = 0.81

    if (sampleType === "string" && sampleStringLength > 100) guesses.string = 0.98

    return guesses
  }

  private _inferType() {
    const columnObj = this._getColDefObject()
    const sample = this._getSample()
    if (columnObj && columnObj.type && Column.getPrimitiveTypeByName(columnObj.type)) return Column.getPrimitiveTypeByName(columnObj.type)

    const guesses: any = Column._getColumnProbabilities(this.getColumnName(), this._getSample())

    let max = 0
    let bestGuess = null

    for (let typeScore in guesses) {
      if (guesses[typeScore] > max) {
        max = guesses[typeScore]
        bestGuess = typeScore
      }
    }

    if (bestGuess === "number" && typeof sample === "string") {
      if (sample.match(",")) bestGuess = "numberString"
    }

    if (bestGuess === "date" && typeof sample === "string") {
      if (Column.getPrimitiveTypeByName("day").getProbForColumnSpecimen(sample)) bestGuess = "day"
    }

    return Column.getPrimitiveTypeByName(bestGuess)
  }

  // Note: If it returns a string removes spaces
  static convertValueToNumeric(
    value: any,
    sourceType: jTableTypes.primitiveType,
    destinationType: jTableTypes.primitiveType,
    mathFn?: Function
  ): number | string | any {
    const destType = this.getPrimitiveTypeByName(destinationType)
    if (value === undefined || !destType || value === "") return ""
    const conversionFn = this._getConversionFn(sourceType, destinationType, value)
    const res = conversionFn(value)
    if (mathFn) return mathFn(res)
    return res
  }

  private static _getConversionFn(sourceType: jTableTypes.primitiveType, destinationType: jTableTypes.primitiveType, value: any): (value: string) => number {
    const sourceCol = this.getPrimitiveTypeByName(sourceType)
    const destinationCol = this.getPrimitiveTypeByName(destinationType)
    if (!sourceCol || !destinationCol) return destinationCol.fromStringToNumeric

    if (destinationCol.isTemporal() && sourceCol.isTemporal())
      return (val: string) => (<AbstractTemporal>destinationCol).fromDateToNumeric((<AbstractTemporal>sourceCol)._fromStringToDate(val))

    return destinationCol.fromStringToNumeric
  }
}

export { Column }
