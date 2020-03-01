//onsave jtree build produce jtable.browser.js
//onsave jtree build produce jtable.node.js

const { jtree } = require("../index.js")

import { jTableTypes } from "../products/jTableTypes"

// todo: create a Tree Language for number formatting

const d3format = require("d3-format")
const moment = require("moment")
const parseFormat = require("moment-parseformat")

// https://github.com/gentooboontoo/js-quantities
// https://github.com/moment/moment/issues/2469
// todo: ugly. how do we ditch this or test?
if (typeof moment !== "undefined")
  moment.createFromInputFallback = function(momentConfig: any) {
    momentConfig._d = new Date(momentConfig._i)
  }

enum VegaTypes {
  nominal = "nominal",
  ordinal = "ordinal",
  geojson = "geojson",
  quantitative = "quantitative",
  temporal = "temporal"
}

enum JavascriptNativeTypeNames {
  number = "number",
  string = "string",
  Date = "Date",
  boolean = "boolean"
}

interface TemporalType {
  _fromNumericToDate(value: number): Date
  _fromStringToDate(value: string): Date
  getVegaTimeUnit(): jTableTypes.vegaTimeUnit
}

abstract class AbstractPrimitiveType {
  constructor(typeName: jTableTypes.primitiveType) {
    this._name = typeName
  }

  private _name: jTableTypes.primitiveType

  abstract getAsNativeJavascriptType(val: any): string | number | Date

  getPrimitiveTypeName(): jTableTypes.primitiveType {
    return this._name
  }

  abstract getJavascriptTypeName(): JavascriptNativeTypeNames

  // Abstract methods:

  toDisplayString(value: any, format: string) {
    return value
  }

  getDefaultFormat(columnName: jTableTypes.columnName, sample: any): jTableTypes.displayFormat {
    return ""
  }

  getProbForColumnSpecimen(value: any): jTableTypes.probability {
    return 0
  }

  isInvalidValue(value: any) {
    if (value === undefined || value === "") return true
    return false
  }

  abstract fromStringToNumeric(value: string): number

  abstract isString(): boolean

  abstract isTemporal(): boolean

  abstract synthesizeValue(randomNumberFn: Function): any

  abstract isNumeric(): boolean

  abstract getStringExamples(): string[]

  abstract getVegaType(): VegaTypes
}

class BooleanType extends AbstractPrimitiveType {
  getAsNativeJavascriptType(val: any): number {
    // todo: handle false, etc
    return val ? 1 : 0
  }

  synthesizeValue(randomNumberFn: Function) {
    return Math.round(randomNumberFn())
  }

  getJavascriptTypeName() {
    return JavascriptNativeTypeNames.boolean
  }

  fromStringToNumeric(val: any) {
    return val.toString() === "true" ? 1 : 0
  }

  getStringExamples() {
    return ["true"]
  }

  getVegaType() {
    return VegaTypes.nominal
  }

  isNumeric() {
    return false
  }

  isString() {
    return false
  }

  isTemporal() {
    return false
  }
}

abstract class AbstractNumeric extends AbstractPrimitiveType {
  fromStringToNumeric(value: string): number {
    return parseFloat(value)
  }

  synthesizeValue(randomNumberFn: Function) {
    // todo: min/max etc
    return this.getMin() + Math.floor((this.getMax() - this.getMin()) * randomNumberFn())
  }

  getMax() {
    return 100
  }

  getMin() {
    return 0
  }

  getAsNativeJavascriptType(val: any): number {
    if (val === undefined) return NaN
    const valType = typeof val
    if (valType === "string") return this.fromStringToNumeric(val)
    else if (val instanceof Date) return Math.round(val.getDate() / 1000)
    // Is a number
    return val
  }

  getJavascriptTypeName() {
    return JavascriptNativeTypeNames.number
  }

  getVegaType() {
    return VegaTypes.quantitative
  }

  isString() {
    return false
  }

  isTemporal() {
    return false
  }

  isNumeric() {
    return true
  }

  isInvalidValue(value: any) {
    return super.isInvalidValue(value) || isNaN(value)
  }
}

class IntType extends AbstractNumeric {
  fromStringToNumeric(val: string) {
    return parseInt(val)
  }

  getStringExamples() {
    return ["30"]
  }

  getVegaType() {
    return VegaTypes.quantitative
  }

  isNumeric() {
    return true
  }

  isString() {
    return false
  }

  isTemporal() {
    return false
  }
}

class Feet extends AbstractNumeric {
  getProbForColumnSpecimen(sample: any) {
    return isNaN(Feet.feetToInches(sample)) ? 0 : 1
  }
  fromStringToNumeric(val: string) {
    return Feet.feetToInches(val)
  }
  toDisplayString(value: any, format: string) {
    value = parseFloat(value)
    const inches = Math.round(value % 12)
    const feet = Math.floor(value / 12)
    return `${feet}'${inches}"`
  }

  getStringExamples() {
    return ["5'10\""]
  }

  // Return inches given formats like 6'1 6'2"
  static feetToInches(numStr: string) {
    let result = 0
    const indexOfDelimited = numStr.search(/[^0-9\.]/)
    if (indexOfDelimited < 1) {
      result = parseFloat(numStr.replace(/[^0-9\.]/g, ""))
      return isNaN(result) ? result : result * 12
    }
    const feetPart = parseFloat(numStr.substr(0, indexOfDelimited).replace(/[^0-9\.]/g, ""))
    const inchesPart = parseFloat(numStr.substr(indexOfDelimited).replace(/[^0-9\.]/g, ""))
    if (!isNaN(feetPart)) result += feetPart * 12
    if (!isNaN(inchesPart)) result += inchesPart
    return result
  }
}

abstract class AbstractCurrency extends AbstractNumeric {}

class USD extends AbstractCurrency {
  toDisplayString(value: any, format: string) {
    return format ? d3format.format(format)(value) : value
  }

  fromStringToNumeric(value: string) {
    return parseFloat(value.toString().replace(/[\$\, \%]/g, ""))
  }
  getProbForColumnSpecimen(sample: any) {
    return sample && sample.match && !!sample.match(/^\$[0-9\.\,]+$/) ? 1 : 0
  }
  getDefaultFormat() {
    return "($.2f"
  }

  getStringExamples() {
    return ["$2.22"]
  }
}

class NumberCol extends AbstractNumeric {
  // https://github.com/d3/d3-format
  toDisplayString(value: any, format: string) {
    if (format === "percent") return d3format.format("(.2f")(parseFloat(value)) + "%"

    // Need the isNan bc numeral will throw otherwise
    if (format && !isNaN(value) && value !== Infinity) return d3format.format(format)(value)

    return value
  }
  getDefaultFormat(columnName: jTableTypes.columnName, sample: any) {
    if (columnName.match(/^(mile|pound|inch|feet)s?$/i)) return "(.1f"

    if (columnName.match(/^(calorie|steps)s?$/i)) return ","

    if (sample && !sample.toString().includes(".")) return ","
  }

  getStringExamples() {
    return ["2.22"]
  }
}

class NumberString extends AbstractNumeric {
  toDisplayString(value: any, format: string) {
    return format ? d3format.format(format)(value) : value
  }
  getDefaultFormat() {
    return ","
  }
  fromStringToNumeric(str: string) {
    return parseFloat(str.toString().replace(/[\$\, \%]/g, ""))
  }

  getStringExamples() {
    return ["2,000"]
  }
}

class ObjectType extends AbstractPrimitiveType {
  getAsNativeJavascriptType(val: any): string {
    return val === undefined ? "" : val.toString()
  }
  // todo: not sure about this.
  getStringExamples() {
    return ["{score: 10}"]
  }

  synthesizeValue() {
    return {}
  }

  fromStringToNumeric(): number {
    return undefined
  }

  getJavascriptTypeName() {
    return JavascriptNativeTypeNames.string
  }

  getVegaType() {
    return VegaTypes.nominal
  }

  isNumeric() {
    return false
  }

  isString() {
    return false
  }

  isTemporal() {
    return false
  }
}

abstract class AbstractStringCol extends AbstractPrimitiveType {
  isString() {
    return true
  }
  isNumeric() {
    return false
  }
  getStringExamples() {
    return ["Anything"]
  }

  getVegaType() {
    return VegaTypes.nominal
  }

  synthesizeValue() {
    return "randomString"
  }

  getJavascriptTypeName() {
    return JavascriptNativeTypeNames.string
  }

  fromStringToNumeric(): number {
    return undefined
  }

  isTemporal() {
    return false
  }

  getAsNativeJavascriptType(val: any): string {
    return val === undefined ? "" : val.toString()
  }
}

class StringCol extends AbstractStringCol {}

class UrlCol extends AbstractStringCol {
  getStringExamples() {
    return ["www.foo.com"]
  }
}

class TextCol extends AbstractStringCol {}

abstract class AbstractCodeCol extends AbstractStringCol {}

class CodeCol extends AbstractCodeCol {
  getStringExamples() {
    return ["i++"]
  }
}

class HTMLCol extends AbstractCodeCol {
  getStringExamples() {
    return ["<b>hi</b>"]
  }
}

abstract class AbstractPathCol extends AbstractStringCol {}

// filepath
class PathCol extends AbstractPathCol {}

// Directory
class DirCol extends AbstractPathCol {}

abstract class AbstractTemporal extends AbstractPrimitiveType implements TemporalType {
  _fromStringToDate(value: string) {
    return moment(parseInt(value)).toDate()
  }

  getAsNativeJavascriptType(val: any): Date | number {
    if (val === undefined) return undefined
    const valType = typeof val
    if (valType === "string") return this._fromStringToDate(val)
    else if (val instanceof Date) return val
    return this._fromNumericToDate(val)
  }

  fromDateToNumeric(date: Date) {
    return moment(date).unix()
  }

  getJavascriptTypeName() {
    return JavascriptNativeTypeNames.Date
  }

  synthesizeValue() {
    return new Date()
  }

  isNumeric() {
    return true
  }

  isString() {
    return false
  }

  isTemporal() {
    return true
  }

  getVegaType() {
    return VegaTypes.temporal
  }

  getVegaTimeUnit(): jTableTypes.vegaTimeUnit {
    return undefined
  }

  _fromNumericToDate(value: number): jTableTypes.moment {
    return moment(value).toDate()
  }
}

class DateCol extends AbstractTemporal {
  toDisplayString(value: any, format: string) {
    if (!format) format = "MM/DD/YY"

    if (format === "fromNow") return moment(parseFloat(value)).fromNow()

    // todo: make sure we are working with numeric values?
    return moment(value).format(format)
  }

  fromStringToNumeric(value: string) {
    return DateCol.getDate(value).unix() * 1000
  }

  _fromStringToDate(value: string) {
    return DateCol.getDate(value).toDate()
  }

  getProbForColumnSpecimen(value: any) {
    const isValid = DateCol.getDate(value).isValid()
    return isValid
  }

  getStringExamples() {
    return ["01/01/01"]
  }

  static getDateAsUnixUtx(value: any) {
    return this.getDate(value, moment.utc).unix()
  }
  static getDate(value: any, momentFn = moment) {
    let result = momentFn(value)

    if (result.isValid()) return result

    if (typeof value === "string" && value.match(/^[0-9]{8}$/)) {
      const first2 = parseInt(value.substr(0, 2))
      const second2 = parseInt(value.substr(2, 2))
      const third2 = parseInt(value.substr(4, 2))
      const last2 = parseInt(value.substr(6, 2))
      const first4 = parseInt(value.substr(0, 4))
      const last4 = parseInt(value.substr(4, 4))

      const first2couldBeDay = first2 < 32
      const first2couldBeMonth = first2 < 13
      const second2couldBeDay = second2 < 32
      const second2couldBeMonth = second2 < 13
      const third2couldBeDay = third2 < 32
      const third2couldBeMonth = third2 < 13
      const last2couldBeDay = last2 < 32
      const last2couldBeMonth = last2 < 13
      const last4looksLikeAYear = last4 > 1000 && last4 < 2100
      const first4looksLikeAYear = first4 > 1000 && first4 < 2100

      // MMDDYYYY
      // YYYYMMDD
      // Prioritize the above 2 american versions
      // YYYYDDMM
      // DDMMYYYY

      if (first2couldBeMonth && second2couldBeDay && last4looksLikeAYear) result = momentFn(value, "MMDDYYYY")
      else if (first4looksLikeAYear && third2couldBeMonth && last2couldBeDay) result = momentFn(value, "YYYYMMDD")
      else if (first4looksLikeAYear && last2couldBeMonth) result = momentFn(value, "YYYYDDMM")
      else result = momentFn(value, "DDMMYYYY")

      return result
    } else if (typeof value === "string" && value.match(/^[0-9]{2}\/[0-9]{4}$/))
      // MM/YYYY
      return momentFn(value, "MM/YYYY")

    // Check if timestamp
    if (value.match && !value.match(/[^0-9]/)) {
      const num = parseFloat(value)
      if (!isNaN(num)) {
        if (value.length === 10) return momentFn(num * 1000)
        else return momentFn(num)
      }
    }

    // Okay to return an invalid result if we dont find a match
    // todo: why??? should we return "" instead ?
    return result
  }
}

// Beginning of day
class Day extends AbstractTemporal {
  toDisplayString(value: any, format: string) {
    return moment(value).format(format || "MM/DD/YYYY")
  }
  fromStringToNumeric(value: string) {
    return (
      DateCol.getDate(value)
        .startOf("day")
        .unix() * 1000
    )
  }

  getVegaTimeUnit(): jTableTypes.vegaTimeUnit {
    return undefined
  }

  _fromStringToDate(value: string) {
    return DateCol.getDate(value)
      .startOf("day")
      .toDate()
  }
  fromDateToNumeric(date: Date) {
    return (
      moment(date)
        .startOf("day")
        .unix() * 1000
    )
  }
  getStringExamples() {
    return ["01/01/01"]
  }
  getProbForColumnSpecimen(sample: any) {
    const format = moment.parseFormat ? moment.parseFormat(sample) : parseFormat
    return format === "MM/DD/YY" || format === "MM/DD/YYYY" || format === "M/D/YYYY" ? 1 : 0
  }
}

class HourMinute extends AbstractTemporal {
  // todo: is this correct? I dont think so.
  fromStringToNumeric(value: string) {
    return parseFloat(DateCol.getDate(value).format("H.m"))
  }

  getVegaTimeUnit() {
    return <jTableTypes.vegaTimeUnit>"hoursminutes"
  }

  // todo: is this correct? I dont think so.
  getStringExamples() {
    return ["2:30"]
  }
}

class Minute extends AbstractTemporal {
  toDisplayString(value: any, format: string) {
    return moment(value).format("m")
  }
  fromStringToNumeric(value: string) {
    return (
      DateCol.getDate(value)
        .startOf("minute")
        .unix() * 1000
    )
  }

  getVegaTimeUnit() {
    return <jTableTypes.vegaTimeUnit>"minutes"
  }

  getStringExamples() {
    return ["30"]
  }
}

abstract class AbstractTemporalInt extends AbstractTemporal implements TemporalType {
  fromStringToNumeric(val: string) {
    return parseInt(val)
  }

  // getAsNativeJavascriptType(val: any): number {
  //   const result = super.getAsNativeJavascriptType(val)
  //   return result === undefined ? undefined : this.fromDateToNumeric(result)
  // }

  getStringExamples() {
    return ["30"]
  }

  isNumeric() {
    return true
  }

  isString() {
    return false
  }

  fromDateToNumeric(date: Date) {
    return moment(date).unix()
  }

  _fromStringToDate(val: string) {
    return moment(parseFloat(val)).toDate()
  }

  _fromNumericToDate(value: number) {
    return moment(value).toDate()
  }

  getVegaTimeUnit() {
    return <jTableTypes.vegaTimeUnit>"seconds"
  }
}

class Week extends AbstractTemporalInt {
  toDisplayString(value: any, format: string) {
    return moment(value).format("MM/DD/YYYY - WW")
  }
  fromDateToNumeric(date: Date) {
    return (
      moment(date)
        .startOf("week")
        .unix() * 1000
    )
  }

  getVegaTimeUnit() {
    return <jTableTypes.vegaTimeUnit>"quartermonth"
  }
}

class Month extends AbstractTemporalInt {
  toDisplayString(value: any, format: string) {
    return moment(value).format(format || "MMMM")
  }
  fromDateToNumeric(date: Date) {
    return (
      moment(date)
        .startOf("month")
        .unix() * 1000
    )
  }

  getVegaTimeUnit() {
    return <jTableTypes.vegaTimeUnit>"month"
  }
}

class MonthDay extends AbstractTemporalInt {
  toDisplayString(value: any, format: string) {
    return moment(value).format(format || "MMDD")
  }
  fromDateToNumeric(date: Date) {
    return moment(date).unix() * 1000
  }
  getVegaTimeUnit() {
    return <jTableTypes.vegaTimeUnit>"monthdate"
  }
}

class Hour extends AbstractTemporalInt {
  fromDateToNumeric(date: Date) {
    return parseInt(
      moment(date)
        .startOf("hour")
        .format("H")
    )
  }

  getVegaTimeUnit() {
    return <jTableTypes.vegaTimeUnit>"hours"
  }
}

class Year extends AbstractTemporalInt {
  fromDateToNumeric(date: Date) {
    return parseInt(moment(date).format("YYYY"))
  }

  _fromStringToDate(val: string) {
    return moment(parseFloat(val), "YYYY").toDate()
  }

  toDisplayString(value: any, format: string) {
    return moment(value).format(format || "YYYY")
  }

  getVegaTimeUnit(): jTableTypes.vegaTimeUnit {
    return "year"
  }

  _fromNumericToDate(value: number): jTableTypes.moment {
    return moment(value, "YYYY").toDate()
  }

  isTemporal() {
    return true
  }
}

abstract class AbstractMillisecond extends AbstractTemporalInt {
  toDisplayString(value: any, format: string) {
    if (format === "fromNow") return moment(parseFloat(value)).fromNow()
    return value
  }

  isTemporal() {
    return true
  }

  getDefaultFormat() {
    return "fromNow"
  }
}

class MilliSecond extends AbstractMillisecond {
  getVegaTimeUnit(): jTableTypes.vegaTimeUnit {
    return "milliseconds"
  }
}

class Second extends AbstractMillisecond {
  fromStringToNumeric(value: string) {
    return parseInt(value) * 1000
  }

  getVegaTimeUnit(): jTableTypes.vegaTimeUnit {
    return "seconds"
  }

  _fromNumericToDate(number: number) {
    return moment(number * 1000).toDate()
  }

  toDisplayString(value: any, format: string) {
    if (format === "fromNow") return moment(parseFloat(value) * 1000).fromNow()
    return value
  }
}

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

  _getSourceColumnName() {
    return this._colDefObject.source
  }

  isInvalidValue(value: any) {
    return this.getPrimitiveTypeObj().isInvalidValue(value)
  }

  private _getFirstNonEmptyValueFromSampleSet() {
    if (this._sample === undefined) {
      const sampleSet = this._getSampleSet()
      this._sample = sampleSet.length ? sampleSet.find(value => !jtree.Utils.isValueEmpty(value)) : ""
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

  synthesizeValue(randomNumberFn: Function) {
    return this.getPrimitiveTypeObj().synthesizeValue(randomNumberFn)
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
    const sample = this._getFirstNonEmptyValueFromSampleSet()
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
    return this.getPrimitiveTypeObj().getDefaultFormat(this.getColumnName(), this._getFirstNonEmptyValueFromSampleSet())
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

  getValues() {
    return this._getSummaryVector().values
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

  getMin() {
    return this.getReductions().min
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
    const sample = this._getFirstNonEmptyValueFromSampleSet()
    if (columnObj && columnObj.type && Column.getPrimitiveTypeByName(columnObj.type)) return Column.getPrimitiveTypeByName(columnObj.type)

    const guesses: any = Column._getColumnProbabilities(this.getColumnName(), this._getFirstNonEmptyValueFromSampleSet())

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
  static convertValueToNumeric(value: any, sourceType: jTableTypes.primitiveType, destinationType: jTableTypes.primitiveType, mathFn?: Function): number | string | any {
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

    if (destinationCol.isTemporal() && sourceCol.isTemporal()) return (val: string) => (<AbstractTemporal>destinationCol).fromDateToNumeric((<AbstractTemporal>sourceCol)._fromStringToDate(val))

    return destinationCol.fromStringToNumeric
  }
}

const PrimitiveTypes = {
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
}

export { Column, PrimitiveTypes }
