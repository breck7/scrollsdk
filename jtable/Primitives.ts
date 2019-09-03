import { jTableTypes } from "../worldWideTypes/jTableTypes"
import * as d3format from "d3-format"

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

const moment = require("moment")
const parseFormat = require("moment-parseformat")

// https://github.com/gentooboontoo/js-quantities
// https://github.com/moment/moment/issues/2469
// todo: ugly. how do we ditch this or test?
moment.createFromInputFallback = function(momentConfig: any) {
  momentConfig._d = new Date(momentConfig._i)
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

  abstract isNumeric(): boolean

  abstract getStringExamples(): string[]

  abstract getVegaType(): VegaTypes
}

class BooleanType extends AbstractPrimitiveType {
  getAsNativeJavascriptType(val: any): number {
    // todo: handle false, etc
    return val ? 1 : 0
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
    return "$(0a)"
  }

  getStringExamples() {
    return ["$2.22"]
  }
}

class NumberCol extends AbstractNumeric {
  toDisplayString(value: any, format: string) {
    if (format === "percent") return d3format.format("0.00")(parseFloat(value)) + "%"

    // Need the isNan bc numeral will throw otherwise
    if (format && !isNaN(value) && value !== Infinity) return d3format.format(format)(value)

    return value
  }
  getDefaultFormat(columnName: jTableTypes.columnName, sample: any) {
    if (columnName.match(/^(mile|pound|inch|feet)s?$/i)) return "0.0"

    if (columnName.match(/^(calorie|steps)s?$/i)) return "0,0"

    if (sample && !sample.toString().includes(".")) return "0,0"
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
    return "0,0"
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

export {
  AbstractPrimitiveType,
  BooleanType,
  IntType,
  Feet,
  USD,
  NumberCol,
  NumberString,
  ObjectType,
  StringCol,
  UrlCol,
  TextCol,
  CodeCol,
  HTMLCol,
  PathCol,
  DirCol,
  DateCol,
  Day,
  Minute,
  HourMinute,
  Second,
  MilliSecond,
  Year,
  Week,
  MonthDay,
  Month,
  Hour,
  AbstractTemporal
}
