//onsave jtree build produce jtable.browser.js
//onsave jtree build produce jtable.node.js
// todo: create a Tree Language for number formatting
// https://github.com/gentooboontoo/js-quantities
// https://github.com/moment/moment/issues/2469
// todo: ugly. how do we ditch this or test?
if (typeof moment !== "undefined")
  moment.createFromInputFallback = function(momentConfig) {
    momentConfig._d = new Date(momentConfig._i)
  }
var VegaTypes
;(function(VegaTypes) {
  VegaTypes["nominal"] = "nominal"
  VegaTypes["ordinal"] = "ordinal"
  VegaTypes["geojson"] = "geojson"
  VegaTypes["quantitative"] = "quantitative"
  VegaTypes["temporal"] = "temporal"
})(VegaTypes || (VegaTypes = {}))
var JavascriptNativeTypeNames
;(function(JavascriptNativeTypeNames) {
  JavascriptNativeTypeNames["number"] = "number"
  JavascriptNativeTypeNames["string"] = "string"
  JavascriptNativeTypeNames["Date"] = "Date"
  JavascriptNativeTypeNames["boolean"] = "boolean"
})(JavascriptNativeTypeNames || (JavascriptNativeTypeNames = {}))
class AbstractPrimitiveType {
  constructor(typeName) {
    this._name = typeName
  }
  getPrimitiveTypeName() {
    return this._name
  }
  // Abstract methods:
  toDisplayString(value, format) {
    return value
  }
  getDefaultFormat(columnName, sample) {
    return ""
  }
  getProbForColumnSpecimen(value) {
    return 0
  }
  isInvalidValue(value) {
    if (value === undefined || value === "") return true
    return false
  }
}
class BooleanType extends AbstractPrimitiveType {
  getAsNativeJavascriptType(val) {
    // todo: handle false, etc
    return val ? 1 : 0
  }
  synthesizeValue(randomNumberFn) {
    return Math.round(randomNumberFn())
  }
  getJavascriptTypeName() {
    return JavascriptNativeTypeNames.boolean
  }
  fromStringToNumeric(val) {
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
class AbstractNumeric extends AbstractPrimitiveType {
  fromStringToNumeric(value) {
    return parseFloat(value)
  }
  synthesizeValue(randomNumberFn) {
    // todo: min/max etc
    return this.getMin() + Math.floor((this.getMax() - this.getMin()) * randomNumberFn())
  }
  getMax() {
    return 100
  }
  getMin() {
    return 0
  }
  getAsNativeJavascriptType(val) {
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
  isInvalidValue(value) {
    return super.isInvalidValue(value) || isNaN(value)
  }
}
class IntType extends AbstractNumeric {
  fromStringToNumeric(val) {
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
  getProbForColumnSpecimen(sample) {
    return isNaN(Feet.feetToInches(sample)) ? 0 : 1
  }
  fromStringToNumeric(val) {
    return Feet.feetToInches(val)
  }
  toDisplayString(value, format) {
    value = parseFloat(value)
    const inches = Math.round(value % 12)
    const feet = Math.floor(value / 12)
    return `${feet}'${inches}"`
  }
  getStringExamples() {
    return ["5'10\""]
  }
  // Return inches given formats like 6'1 6'2"
  static feetToInches(numStr) {
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
class AbstractCurrency extends AbstractNumeric {}
class USD extends AbstractCurrency {
  toDisplayString(value, format) {
    return format ? d3format.format(format)(value) : value
  }
  fromStringToNumeric(value) {
    return parseFloat(value.toString().replace(/[\$\, \%]/g, ""))
  }
  getProbForColumnSpecimen(sample) {
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
  toDisplayString(value, format) {
    if (format === "percent") return d3format.format("(.2f")(parseFloat(value)) + "%"
    // Need the isNan bc numeral will throw otherwise
    if (format && !isNaN(value) && value !== Infinity) return d3format.format(format)(value)
    return value
  }
  getDefaultFormat(columnName, sample) {
    if (columnName.match(/^(mile|pound|inch|feet)s?$/i)) return "(.1f"
    if (columnName.match(/^(calorie|steps)s?$/i)) return ","
    if (sample && !sample.toString().includes(".")) return ","
  }
  getStringExamples() {
    return ["2.22"]
  }
}
class NumberString extends AbstractNumeric {
  toDisplayString(value, format) {
    return format ? d3format.format(format)(value) : value
  }
  getDefaultFormat() {
    return ","
  }
  fromStringToNumeric(str) {
    return parseFloat(str.toString().replace(/[\$\, \%]/g, ""))
  }
  getStringExamples() {
    return ["2,000"]
  }
}
class ObjectType extends AbstractPrimitiveType {
  getAsNativeJavascriptType(val) {
    return val === undefined ? "" : val.toString()
  }
  // todo: not sure about this.
  getStringExamples() {
    return ["{score: 10}"]
  }
  synthesizeValue() {
    return {}
  }
  fromStringToNumeric() {
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
class AbstractStringCol extends AbstractPrimitiveType {
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
  fromStringToNumeric() {
    return undefined
  }
  isTemporal() {
    return false
  }
  getAsNativeJavascriptType(val) {
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
class AbstractCodeCol extends AbstractStringCol {}
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
class AbstractPathCol extends AbstractStringCol {}
// filepath
class PathCol extends AbstractPathCol {}
// Directory
class DirCol extends AbstractPathCol {}
class AbstractTemporal extends AbstractPrimitiveType {
  _fromStringToDate(value) {
    return moment(parseInt(value)).toDate()
  }
  getAsNativeJavascriptType(val) {
    if (val === undefined) return undefined
    const valType = typeof val
    if (valType === "string") return this._fromStringToDate(val)
    else if (val instanceof Date) return val
    return this._fromNumericToDate(val)
  }
  fromDateToNumeric(date) {
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
  getVegaTimeUnit() {
    return undefined
  }
  _fromNumericToDate(value) {
    return moment(value).toDate()
  }
}
class DateCol extends AbstractTemporal {
  toDisplayString(value, format) {
    if (!format) format = "MM/DD/YY"
    if (format === "fromNow") return moment(parseFloat(value)).fromNow()
    // todo: make sure we are working with numeric values?
    return moment(value).format(format)
  }
  fromStringToNumeric(value) {
    return DateCol.getDate(value).unix() * 1000
  }
  _fromStringToDate(value) {
    return DateCol.getDate(value).toDate()
  }
  getProbForColumnSpecimen(value) {
    const isValid = DateCol.getDate(value).isValid()
    return isValid
  }
  getStringExamples() {
    return ["01/01/01"]
  }
  static getDateAsUnixUtx(value) {
    return this.getDate(value, moment.utc).unix()
  }
  static getDate(value, momentFn = moment) {
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
  toDisplayString(value, format) {
    return moment(value).format(format || "MM/DD/YYYY")
  }
  fromStringToNumeric(value) {
    return (
      DateCol.getDate(value)
        .startOf("day")
        .unix() * 1000
    )
  }
  getVegaTimeUnit() {
    return undefined
  }
  _fromStringToDate(value) {
    return DateCol.getDate(value)
      .startOf("day")
      .toDate()
  }
  fromDateToNumeric(date) {
    return (
      moment(date)
        .startOf("day")
        .unix() * 1000
    )
  }
  getStringExamples() {
    return ["01/01/01"]
  }
  getProbForColumnSpecimen(sample) {
    const format = moment.parseFormat ? moment.parseFormat(sample) : parseFormat
    return format === "MM/DD/YY" || format === "MM/DD/YYYY" || format === "M/D/YYYY" ? 1 : 0
  }
}
class HourMinute extends AbstractTemporal {
  // todo: is this correct? I dont think so.
  fromStringToNumeric(value) {
    return parseFloat(DateCol.getDate(value).format("H.m"))
  }
  getVegaTimeUnit() {
    return "hoursminutes"
  }
  // todo: is this correct? I dont think so.
  getStringExamples() {
    return ["2:30"]
  }
}
class Minute extends AbstractTemporal {
  toDisplayString(value, format) {
    return moment(value).format("m")
  }
  fromStringToNumeric(value) {
    return (
      DateCol.getDate(value)
        .startOf("minute")
        .unix() * 1000
    )
  }
  getVegaTimeUnit() {
    return "minutes"
  }
  getStringExamples() {
    return ["30"]
  }
}
class AbstractTemporalInt extends AbstractTemporal {
  fromStringToNumeric(val) {
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
  fromDateToNumeric(date) {
    return moment(date).unix()
  }
  _fromStringToDate(val) {
    return moment(parseFloat(val)).toDate()
  }
  _fromNumericToDate(value) {
    return moment(value).toDate()
  }
  getVegaTimeUnit() {
    return "seconds"
  }
}
class Week extends AbstractTemporalInt {
  toDisplayString(value, format) {
    return moment(value).format("MM/DD/YYYY - WW")
  }
  fromDateToNumeric(date) {
    return (
      moment(date)
        .startOf("week")
        .unix() * 1000
    )
  }
  getVegaTimeUnit() {
    return "quartermonth"
  }
}
class Month extends AbstractTemporalInt {
  toDisplayString(value, format) {
    return moment(value).format(format || "MMMM")
  }
  fromDateToNumeric(date) {
    return (
      moment(date)
        .startOf("month")
        .unix() * 1000
    )
  }
  getVegaTimeUnit() {
    return "month"
  }
}
class MonthDay extends AbstractTemporalInt {
  toDisplayString(value, format) {
    return moment(value).format(format || "MMDD")
  }
  fromDateToNumeric(date) {
    return moment(date).unix() * 1000
  }
  getVegaTimeUnit() {
    return "monthdate"
  }
}
class Hour extends AbstractTemporalInt {
  fromDateToNumeric(date) {
    return parseInt(
      moment(date)
        .startOf("hour")
        .format("H")
    )
  }
  getVegaTimeUnit() {
    return "hours"
  }
}
class Year extends AbstractTemporalInt {
  fromDateToNumeric(date) {
    return parseInt(moment(date).format("YYYY"))
  }
  _fromStringToDate(val) {
    return moment(parseFloat(val), "YYYY").toDate()
  }
  toDisplayString(value, format) {
    return moment(value).format(format || "YYYY")
  }
  getVegaTimeUnit() {
    return "year"
  }
  _fromNumericToDate(value) {
    return moment(value, "YYYY").toDate()
  }
  isTemporal() {
    return true
  }
}
class AbstractMillisecond extends AbstractTemporalInt {
  toDisplayString(value, format) {
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
  getVegaTimeUnit() {
    return "milliseconds"
  }
}
class Second extends AbstractMillisecond {
  fromStringToNumeric(value) {
    return parseInt(value) * 1000
  }
  getVegaTimeUnit() {
    return "seconds"
  }
  _fromNumericToDate(number) {
    return moment(number * 1000).toDate()
  }
  toDisplayString(value, format) {
    if (format === "fromNow") return moment(parseFloat(value) * 1000).fromNow()
    return value
  }
}
// todo: ADD TYPINGS
class Column {
  constructor(colDef = {}, rawAnyVector) {
    this._colDefObject = colDef
    this._rawAnyVectorFromSource = rawAnyVector
    this._sampleSet = jtree.Utils.sampleWithoutReplacement(rawAnyVector, 30, Date.now())
  }
  static _getPrimitiveTypesCollection() {
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
  static getPrimitiveTypeByName(name) {
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
  isInvalidValue(value) {
    return this.getPrimitiveTypeObj().isInvalidValue(value)
  }
  _getFirstNonEmptyValueFromSampleSet() {
    if (this._sample === undefined) {
      const sampleSet = this._getSampleSet()
      this._sample = sampleSet.length ? sampleSet.find(value => !jtree.Utils.isValueEmpty(value)) : ""
    }
    return this._sample
  }
  _getColDefObject() {
    return this._colDefObject
  }
  getPrimitiveTypeObj() {
    if (!this._type) this._type = this._inferType()
    return this._type
  }
  synthesizeValue(randomNumberFn) {
    return this.getPrimitiveTypeObj().synthesizeValue(randomNumberFn)
  }
  isTemporal() {
    return this.getPrimitiveTypeObj().isTemporal()
  }
  toDisplayString(value) {
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
    const possibilities = {}
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
    const titleCols = {
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
    const type = this.getPrimitiveTypeObj()
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
  _getSummaryVector() {
    if (!this._summaryVector) this._summaryVector = this._createSummaryVector()
    return this._summaryVector
  }
  _getRawAnyVectorFromSource() {
    return this._rawAnyVectorFromSource
  }
  _createSummaryVector() {
    const values = []
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
  getPrimitiveTypeName() {
    return this.getPrimitiveTypeObj().getPrimitiveTypeName()
  }
  toObject() {
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
  _getReductionResult(valuesObj, col) {
    const values = valuesObj.values
    const count = values.length
    const reductionResult = {}
    reductionResult.incompleteCount = valuesObj.incompleteCount
    reductionResult.uniqueValues = valuesObj.uniqueValues
    if (!count) return reductionResult
    const numericCompare = (av, bv) => (av > bv ? 1 : av < bv ? -1 : 0)
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
  static _getColumnProbabilities(name, sample) {
    // Assume data is trimmed.
    const sampleType = typeof sample
    const sampleStringLength = sample !== undefined ? sample.toString().length : 0
    const guesses = {}
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
  _inferType() {
    const columnObj = this._getColDefObject()
    const sample = this._getFirstNonEmptyValueFromSampleSet()
    if (columnObj && columnObj.type && Column.getPrimitiveTypeByName(columnObj.type)) return Column.getPrimitiveTypeByName(columnObj.type)
    const guesses = Column._getColumnProbabilities(this.getColumnName(), this._getFirstNonEmptyValueFromSampleSet())
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
  static convertValueToNumeric(value, sourceType, destinationType, mathFn) {
    const destType = this.getPrimitiveTypeByName(destinationType)
    if (value === undefined || !destType || value === "") return ""
    const conversionFn = this._getConversionFn(sourceType, destinationType, value)
    const res = conversionFn(value)
    if (mathFn) return mathFn(res)
    return res
  }
  static _getConversionFn(sourceType, destinationType, value) {
    const sourceCol = this.getPrimitiveTypeByName(sourceType)
    const destinationCol = this.getPrimitiveTypeByName(destinationType)
    if (!sourceCol || !destinationCol) return destinationCol.fromStringToNumeric
    if (destinationCol.isTemporal() && sourceCol.isTemporal()) return val => destinationCol.fromDateToNumeric(sourceCol._fromStringToDate(val))
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
window.Column = Column
window.PrimitiveTypes = PrimitiveTypes
//onsave jtree build produce jtable.browser.js
//onsave jtree build produce jtable.node.js
class Row {
  constructor(sourceObject = {}, table) {
    this._puid = this._getUniqueId()
    this._sourceObject = sourceObject
    this._table = table
  }
  _getUniqueId() {
    Row._uniqueId++
    return Row._uniqueId
  }
  destroy() {}
  async destroyRow() {}
  getAsArray(headerRow) {
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
  _parseIntoObjectWithOnlyNativeJavascriptTypes() {
    const columns = this._table.getColumnsMap()
    const typedNode = {}
    Object.keys(columns).forEach(colName => {
      typedNode[colName] = this._getRowValueFromSourceColOrOriginalCol(colName)
    })
    return typedNode
  }
  // why from source col? if we always copy, we shouldnt need that, correct? perhaps have an audit array of all operations on a row?
  _getRowValueFromSourceColOrOriginalCol(colName) {
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
  _getRowValueFromOriginalOrSource(sourceColName, sourceColType, destType) {
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
  getRowOriginalValue(column) {
    const value = this.getRowSourceObject()[column]
    return value === null ? "" : value
  }
  getRowHtmlSafeValue(columnName) {
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
Row._uniqueId = 0
window.Row = Row
//onsave jtree build produce jtable.browser.js
//onsave jtree build produce jtable.node.js
var TableParserIds
;(function(TableParserIds) {
  TableParserIds["csv"] = "csv"
  TableParserIds["ssv"] = "ssv"
  TableParserIds["psv"] = "psv"
  TableParserIds["tsv"] = "tsv"
  TableParserIds["xml"] = "xml"
  TableParserIds["html"] = "html"
  TableParserIds["spaced"] = "spaced"
  TableParserIds["tree"] = "tree"
  TableParserIds["treeRows"] = "treeRows"
  TableParserIds["sections"] = "sections"
  TableParserIds["txt"] = "txt"
  TableParserIds["list"] = "list"
  TableParserIds["text"] = "text"
  TableParserIds["jsonVector"] = "jsonVector"
  TableParserIds["json"] = "json"
  TableParserIds["jsonDataTableWithHeader"] = "jsonDataTableWithHeader"
  TableParserIds["jsonMap"] = "jsonMap"
  TableParserIds["jsonCounts"] = "jsonCounts"
})(TableParserIds || (TableParserIds = {}))
// todo: detect mixed format, like a csv file with a header. and then suggest ignore that part, or splitting it out?
// maybe we could split a string into sections, and say "we've detected 3 sections, which one do you want to use"?
// todo: split csv into normal csv and advanced delimited.
// todo: allow for metadata like filename and filetype header
class RowStringSpecimen {
  constructor(str) {
    const trimmedStr = str.trim()
    const lines = trimmedStr.split(/\n/g)
    const firstLine = lines[0]
    const strCount = (str, reg) => (str.match(reg) || []).length
    // todo: do these things lazily.
    this.trimmedStr = trimmedStr
    this.lines = lines
    this.firstLine = firstLine
    this.lineCount = lines.length
    this.indentedLineCount = strCount(trimmedStr, /\n /g)
    this.blankLineCount = strCount(trimmedStr, /\n\n/g)
    this.commaCount = strCount(trimmedStr, /\,/g)
    this.tabCount = strCount(trimmedStr, /\t/g)
    this.verticalBarCount = strCount(trimmedStr, /\|/g)
    this.firstLineCommaCount = strCount(firstLine, /\,/g)
    this.firstLineTabCount = strCount(firstLine, /\t/g)
    this.firstLineSpaceCount = strCount(firstLine, / /g)
    this.firstLineVerticalBarCount = strCount(firstLine, /\|/g)
  }
  getParsedJsonAttemptResult() {
    if (this._parsedJsonObject) return this._parsedJsonObject
    try {
      this._parsedJsonObject = { ok: true, result: JSON.parse(this.trimmedStr) }
    } catch (err) {
      this._parsedJsonObject = { ok: false }
    }
    return this._parsedJsonObject
  }
}
class AbstractTableParser {
  isNodeJs() {
    return typeof exports !== "undefined"
  }
}
class AbstractJsonParser extends AbstractTableParser {
  getParserId() {
    return TableParserIds.json
  }
  getProbForRowSpecimen(specimen) {
    return 0
  }
  getExample() {
    return JSON.stringify([{ name: "joe", age: 2 }, { name: "mike", age: 4 }])
  }
  _parseTableInputsFromString(str) {
    const obj = JSON.parse(str)
    return { rows: obj instanceof Array ? obj : [obj] }
  }
}
class JsonParser extends AbstractJsonParser {}
class AbstractJsonArrayParser extends AbstractJsonParser {
  getExample() {
    return JSON.stringify([{ name: "jane", age: 33 }, { name: "bill", age: 25 }])
  }
  getProbForRowSpecimen(specimen) {
    const str = specimen.trimmedStr
    if (str.match(/^\s*\[/) && str.match(/\]\s*$/)) return 0.98
    return 0
  }
}
class JsonArrayParser extends AbstractJsonArrayParser {}
class JsonDataTableWithHeaderParser extends AbstractJsonArrayParser {
  getExample() {
    return JSON.stringify([["country", "income", "health", "population"], ["Afghanistan", 1925, "57.63", 32526562], ["Albania", 10620, "76", 2896679]])
  }
  _parseTableInputsFromString(str) {
    return { rows: jtree.Utils.javascriptTableWithHeaderRowToObjects(JSON.parse(str)) }
  }
  getParserId() {
    return TableParserIds.jsonDataTableWithHeader
  }
  getProbForRowSpecimen(specimen) {
    const result = specimen.getParsedJsonAttemptResult()
    if (!result.ok) return 0
    if (JsonDataTableWithHeaderParser.isJavaScriptDataTable(result.result)) return 0.99
    return 0.001
  }
  static isJavaScriptDataTable(obj) {
    const isAnArray = obj instanceof Array
    if (!isAnArray) return false
    const isAnArrayOfArrays = obj.every(row => row instanceof Array)
    if (!isAnArrayOfArrays) return false
    if (obj.length < 3) return false
    const firstRowTypes = obj[0].map(item => typeof item === "string").join(" ")
    const secondRowTypes = obj[1].map(item => typeof item === "string").join(" ")
    const thirdRowTypes = obj[2].map(item => typeof item === "string").join(" ")
    const firstRowIsJustStrings = !firstRowTypes.replace(/true/g, "").trim()
    if (secondRowTypes === thirdRowTypes && secondRowTypes !== firstRowTypes && firstRowIsJustStrings) return true
    return false
  }
}
class AbstractJsonObjectParser extends AbstractJsonParser {
  getProbForRowSpecimen(specimen) {
    const str = specimen.trimmedStr
    if (str.match(/^\s*\{/) && str.match(/\}\s*$/)) return 0.99
    return 0
  }
}
class JsonObjectParser extends AbstractJsonObjectParser {}
// formerley flatobject
class JsonMapParser extends AbstractJsonObjectParser {
  getExample() {
    return JSON.stringify({ person1: { name: "joe", age: 2 }, person2: { name: "mike", age: 4 } })
  }
  getParserId() {
    return TableParserIds.jsonMap
  }
  _parseTableInputsFromString(str) {
    // todo: should we preserve keys?
    return { rows: Object.values(JSON.parse(str)) }
  }
}
// formerly flatarray
class JsonVectorParser extends AbstractJsonArrayParser {
  getExample() {
    return JSON.stringify([23, 32, 41])
  }
  getParserId() {
    return TableParserIds.jsonVector
  }
  getProbForRowSpecimen(specimen) {
    const result = specimen.getParsedJsonAttemptResult()
    if (!result.ok) return 0
    if (!(result.result instanceof Array)) return 0
    return result.result.filter(item => item && typeof item === "object" && item.hasOwnProperty).length === 0 ? 1 : 0
    return 0
  }
  _parseTableInputsFromString(str) {
    return {
      rows: JSON.parse(str).map(num => {
        return { value: num }
      })
    }
  }
}
class JsonCountMapParser extends AbstractJsonObjectParser {
  getParserId() {
    return TableParserIds.jsonCounts
  }
  getProbForRowSpecimen(specimen) {
    const result = specimen.getParsedJsonAttemptResult()
    if (!result.ok) return 0
    const keys = Object.keys(result.result)
    if (keys.length < 2) return 0
    return !keys.some(key => typeof result.result[key] !== "number") ? 1 : 0
    return 0
  }
  getExample() {
    return JSON.stringify({ h1: 10, h2: 5, h3: 2 })
  }
  _parseTableInputsFromString(str) {
    const obj = JSON.parse(str)
    return {
      rows: Object.keys(obj).map(key => {
        return {
          name: key,
          count: obj[key]
        }
      })
    }
  }
}
// todo: remove?
class AbstractJTreeTableParser extends AbstractTableParser {
  _parseTableInputsFromString(str) {
    return {
      rows: this._parseTrees(str)
        .filter(node => node.length)
        .map(node => node.toObject())
    }
  }
  _parseTrees(str) {
    return []
  }
}
class CsvParser extends AbstractJTreeTableParser {
  getExample() {
    return `name,age,height
john,12,50`
  }
  _parseTrees(str) {
    return jtree.TreeNode.fromCsv(str)
  }
  getProbForRowSpecimen(specimen) {
    if (!specimen.firstLineCommaCount) return 0
    if (specimen.blankLineCount) return 0.05
    return 0.49
  }
  getParserId() {
    return TableParserIds.csv
  }
}
class TsvParser extends AbstractJTreeTableParser {
  getExample() {
    return `name\tage\theight
john\t12\t50`
  }
  _parseTrees(str) {
    return jtree.TreeNode.fromTsv(str)
  }
  getProbForRowSpecimen(specimen) {
    if (!specimen.firstLineTabCount) return 0
    else if (specimen.tabCount > 5) return 0.9
    return 0.25
  }
  getParserId() {
    return TableParserIds.tsv
  }
}
class PsvParser extends AbstractJTreeTableParser {
  getParserId() {
    return TableParserIds.psv
  }
  getExample() {
    return `name|age
mike|33`
  }
  _parseTrees(str) {
    return jtree.TreeNode.fromDelimited(str, "|", '"')
  }
  getProbForRowSpecimen(specimen) {
    // vertical bar separated file
    if (!specimen.firstLineVerticalBarCount) return 0
    else if (specimen.verticalBarCount >= specimen.lineCount) return 0.8
    return 0.01
  }
}
class SsvParser extends AbstractJTreeTableParser {
  getExample() {
    return `name age height
john 12 50`
  }
  getParserId() {
    return TableParserIds.ssv
  }
  _parseTrees(str) {
    return jtree.TreeNode.fromSsv(str)
  }
  getProbForRowSpecimen(specimen) {
    if (!specimen.firstLineSpaceCount) return 0
    if (specimen.blankLineCount) return 0.05
    return 0.11
  }
}
class XmlParser extends AbstractJTreeTableParser {
  getProbForRowSpecimen(specimen) {
    return specimen.trimmedStr.match(/^ *\</) ? 1 : 0
  }
  getExample() {
    return `<person>
 <name>bob</name><age>32</age></person>`
  }
  getParserId() {
    return TableParserIds.xml
  }
  _parseTrees(str) {
    // todo: fix this! Create an XML Tree Language
    if (this.isNodeJs()) return new jtree.TreeNode(str)
    return jtree.TreeNode.fromXml(str)
  }
}
class HtmlParser extends AbstractJTreeTableParser {
  getProbForRowSpecimen(specimen) {
    return specimen.trimmedStr.match(/^(\<\!doctype html\>|\<html|\<div)/i) ? 1 : 0
  }
  getExample() {
    return `<!doctype html>
<html>
 <head>bam</head></html>`
  }
  getParserId() {
    return TableParserIds.html
  }
  _parseTrees(str) {
    if (this.isNodeJs()) return new jtree.TreeNode(str)
    return jtree.TreeNode.fromXml(str)
  }
}
class TreeRowsParser extends AbstractJTreeTableParser {
  getExample() {
    return `person
 name john
 age 12
 height 50`
  }
  _parseTableInputsFromString(str) {
    // todo: get columns on first pass.
    const rows = new jtree.TreeNode(str)
    return {
      rows: rows.map(node => node.toObject()),
      columnDefinitions: rows.getColumnNames().map(name => {
        return { name: name }
      })
    }
  }
  getProbForRowSpecimen(specimen) {
    if (specimen.indentedLineCount < 1) return 0
    return 0.1
  }
  getParserId() {
    return TableParserIds.treeRows
  }
}
class TreeParser extends AbstractJTreeTableParser {
  getExample() {
    return `country
 name USA
 state
  name MA
  city
   name Brockton`
  }
  _parseTrees(str) {
    // todo: add tests. Detected value(s) or undefined subtrees, treating as object.
    const newTree = new jtree.TreeNode()
    newTree.pushContentAndChildren(undefined, str instanceof jtree.TreeNode ? str : new jtree.TreeNode(str))
    return newTree
  }
  getProbForRowSpecimen(specimen) {
    return 0
  }
  getParserId() {
    return TableParserIds.tree
  }
}
class SpacedParser extends AbstractTableParser {
  getExample() {
    return `name john
age 12

name mary
age 20`
  }
  getParserId() {
    return TableParserIds.spaced
  }
  getProbForRowSpecimen(specimen) {
    if (specimen.blankLineCount > 10) return 0.95
    return 0.05
  }
  _parseTableInputsFromString(str) {
    // todo: clean this up. it looks like this is just trees, but not indented, with a newline as a delimiter.
    const headerBreak = str.indexOf("\n\n")
    const header = str.substr(0, headerBreak)
    let names = header.split(/\n/g)
    const rest = str
      .substr(headerBreak + 2)
      .replace(/\n\n/g, "\n")
      .trim()
      .split("\n")
    const nodeCount = names.length
    const lineCount = rest.length
    const rows = []
    // todo: should we do this here?
    names = names.map(name => name.replace(/ /g, ""))
    for (let lineNumber = 0; lineNumber < lineCount; lineNumber = lineNumber + nodeCount) {
      const obj = {}
      names.forEach((col, index) => {
        obj[col] = rest[lineNumber + index].trim()
      })
      rows.push(obj)
    }
    return { rows: rows }
  }
}
class SectionsParser extends AbstractTableParser {
  getExample() {
    return `name
age

john
12

mary
20`
  }
  getProbForRowSpecimen() {
    return 0
  }
  getParserId() {
    return TableParserIds.sections
  }
  _parseTableInputsFromString(str) {
    const firstDoubleNewline = str.indexOf("\n\n")
    const tiles = [str.slice(0, firstDoubleNewline), str.slice(firstDoubleNewline + 1)]
    const header = tiles.shift()
    const names = header.split(/\n/g)
    const length = names.length
    const lines = tiles[0].trim().split(/\n/g)
    const lineCount = lines.length
    const rowCount = lineCount / length
    const rows = []
    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
      const startLine = rowIndex * length
      const values = lines.slice(startLine, startLine + length)
      const obj = {}
      names.forEach((name, colIndex) => (obj[name] = values[colIndex]))
      rows.push(obj)
    }
    return { rows: rows }
  }
}
class ListParser extends AbstractTableParser {
  getExample() {
    return `john doe
frank jones`
  }
  getProbForRowSpecimen() {
    return 0
  }
  getParserId() {
    return TableParserIds.list
  }
  _parseTableInputsFromString(str) {
    return {
      rows: str.split(/\n/g).map((line, index) => {
        return {
          index: index,
          name: line
        }
      })
    }
  }
}
class TextListParser extends ListParser {
  getParserId() {
    return TableParserIds.txt
  }
}
class TextParser extends AbstractTableParser {
  getParserId() {
    return TableParserIds.text
  }
  getExample() {
    return "hello world"
  }
  getProbForRowSpecimen(specimen) {
    if (specimen.blankLineCount) return 0.12
    return 0.05
  }
  _parseTableInputsFromString(str) {
    return { rows: [{ text: str }] }
  }
}
class TableParser {
  constructor() {
    this._parsers = [
      new CsvParser(),
      new TsvParser(),
      new SsvParser(),
      new PsvParser(),
      new TreeRowsParser(),
      new TreeParser(),
      new XmlParser(),
      new HtmlParser(),
      new TextParser(),
      new SectionsParser(),
      new SpacedParser(),
      new ListParser(),
      new TextListParser(),
      new JsonParser(),
      new JsonArrayParser(),
      new JsonDataTableWithHeaderParser(),
      new JsonVectorParser(),
      new JsonMapParser(),
      new JsonCountMapParser()
    ]
    this._parserMap = {}
    this._parsers.forEach(parser => {
      const name = parser.getParserId()
      if (!name) return // only allow leafs to be used as names?
      this._parserMap[name] = parser
    })
  }
  getAllParsers() {
    return this._getParsersArray()
  }
  getAllTableParserIds() {
    return Object.keys(this._getParserMap())
  }
  getExample(parserId) {
    return this._getParser(parserId).getExample()
  }
  _getParser(parserId) {
    const options = this._getParserMap()
    return options[parserId] || options.text // todo: surface an error.
  }
  _getParserMap() {
    return this._parserMap
  }
  _getParsersArray() {
    return this._parsers
  }
  // todo: remove this?
  parseTableInputsFromObject(data, parserId) {
    if (data instanceof Array) {
      if (JsonDataTableWithHeaderParser.isJavaScriptDataTable(data)) return { rows: jtree.Utils.javascriptTableWithHeaderRowToObjects(data) }
      // test to see if it's primitives
      if (typeof data[0] === "object") return { rows: data }
      return { rows: data.map(row => (typeof row === "object" ? row : { value: row })) }
    } else if (parserId === TableParserIds.jsonMap) return { rows: Object.values(data) }
    return { rows: [data] }
  }
  // todo: should this be inferAndParse? or 2 methods? parse and inferAndParse?
  parseTableInputsFromString(str = "", parserId) {
    str = str.trim() // Remove empty lines at end of string, which seem to be common.
    if (!str) return { rows: [] }
    parserId = parserId || this.guessTableParserId(str)
    try {
      return this._getParser(parserId)._parseTableInputsFromString(str)
    } catch (err) {
      console.error(err)
      const snippet = str.substr(0, 30).replace(/[\n\r]/g, " ")
      throw new Error(`Failed parsing string '${snippet}...' using parser '${parserId}'`)
    }
  }
  guessProbabilitiesForAllTableParsers(str) {
    const parsers = this._getParsersArray()
    const length = parsers.length
    const probabilities = {}
    const specimen = new RowStringSpecimen(str)
    for (let index = 0; index < parsers.length; index++) {
      const parser = parsers[index]
      const probability = parser.getProbForRowSpecimen(specimen)
      const name = parser.getParserId()
      if (probability === 1) {
        const exact = {}
        exact[name] = 1
        return exact
      }
      probabilities[name] = probability
    }
    return probabilities
  }
  guessTableParserId(str) {
    const probabilities = this.guessProbabilitiesForAllTableParsers(str)
    let maxScore = 0
    let bestGuess = null
    for (let option in probabilities) {
      if (probabilities[option] > maxScore) {
        maxScore = probabilities[option]
        bestGuess = option
      }
    }
    return bestGuess
  }
}
window.TableParser = TableParser
const DummyDataSets = {
  flowPrograms: [
    ["filename", "bytes", "link"],
    [
      "hello.flow",
      `samples.iris
 tables.basic`,
      ""
    ]
  ],
  amazonPurchases: [
    ["OrderDate", "Title", "Category", "ItemTotal"],
    [1329386400000, "3D Math Primer for Graphics and Game Development (Wordware Game Math Library)", "Paperback", "26.2"],
    [1261735200000, "A Mathematician Reads the Newspaper", "Paperback", "1.19"],
    [1447840800000, "A Most Incomprehensible Thing: Notes Towards a Very Gentle Introduction to the Mathematics of Relativity", "Paperback", "14.63"],
    [1464429600000, "From Mathematics to Generic Programming", "Paperback", "34.37"],
    [1268215200000, "Innumeracy: Mathematical Illiteracy and Its Consequences", "Paperback", "9.89"],
    [1268215200000, "Irreligion: A Mathematician Explains Why the Arguments for God Just Don't Add Up", "Paperback", "9.89"],
    [1379844000000, "Mathematics and the Imagination", "Paperback", "5.3"],
    [1410688800000, "Medical Math (Laminated Reference Guide; Quick Study Academic)", "Pamphlet", "3.78"],
    [1268215200000, "Once Upon A Number: The Hidden Mathematical Logic Of Stories", "Paperback", "14.35"],
    [1408528800000, "The Language of Mathematics: Making the Invisible Visible", "Paperback", "18.37"]
  ],
  waterBill: [
    ["Amount", "PaidOn", "Gallons"],
    ["$64.86", "1/10/2018", 2087],
    ["$73.32", "1/28/2018", 2451],
    ["$62.65", "2/26/2018", 1968],
    ["$71.51", "3/25/2018", 2365],
    ["$65.03", "4/23/2018", 2075],
    ["$81.39", "5/15/2018", 2757],
    ["$65.01", "6/15/2018", 2047],
    ["$93.09", "7/10/2018", 3051],
    ["$196.58", "8/25/2018", 7309],
    ["$130.68", "9/10/2018", 4597],
    ["$55.03", "10/14/2018", 1484],
    ["$63.44", "11/7/2018", 1967],
    ["$71.88", "12/12/2018", 2335],
    ["$53.18", "2/3/2019", 1483],
    ["$52.05", "3/8/2019", 1429],
    ["$54.73", "4/28/2019", 1544]
  ],
  gapMinder: [
    ["country", "income", "health", "population"],
    ["Afghanistan", 1925, "57.63", 32526562],
    ["Albania", 10620, "76", 2896679],
    ["Algeria", 13434, "76.5", 39666519],
    ["Andorra", 46577, "84.1", 70473],
    ["Angola", 7615, "61", 25021974],
    ["Antigua and Barbuda", 21049, "75.2", 91818],
    ["Argentina", 17344, "76.2", 43416755],
    ["Armenia", 7763, "74.4", 3017712],
    ["Australia", 44056, "81.8", 23968973],
    ["Austria", 44401, "81", 8544586],
    ["Azerbaijan", 16986, "72.9", 9753968],
    ["Bahamas", 22818, "72.3", 388019],
    ["Bahrain", 44138, "79.2", 1377237],
    ["Bangladesh", 3161, "70.1", 160995642],
    ["Barbados", 12984, "75.8", 284215],
    ["Belarus", 17415, "70.4", 9495826],
    ["Belgium", 41240, "80.4", 11299192],
    ["Belize", 8501, "70", 359287],
    ["Benin", 1830, "65.5", 10879829],
    ["Bhutan", 7983, "70.2", 774830],
    ["Bolivia", 6295, "72.3", 10724705],
    ["Bosnia and Herzegovina", 9833, "77.9", 3810416],
    ["Botswana", 17196, "66.4", 2262485],
    ["Brazil", 15441, "75.6", 207847528],
    ["Brunei", 73003, "78.7", 423188],
    ["Bulgaria", 16371, "74.9", 7149787],
    ["Burkina Faso", 1654, "62.8", 18105570],
    ["Burundi", 777, "60.4", 11178921],
    ["Cambodia", 3267, "68.4", 15577899],
    ["Cameroon", 2897, "59.5", 23344179],
    ["Canada", 43294, "81.7", 35939927],
    ["Cape Verde", 6514, "74.6", 520502],
    ["Central African Republic", 599, "53.8", 4900274],
    ["Chad", 2191, "57.7", 14037472],
    ["Chile", 22465, "79.3", 17948141],
    ["China", 13334, "76.9", 1376048943],
    ["Colombia", 12761, "75.8", 48228704],
    ["Comoros", 1472, "64.1", 788474],
    ["Congo, Dem. Rep.", 809, "58.3", 77266814],
    ["Congo, Rep.", 6220, "61.9", 4620330],
    ["Costa Rica", 14132, "80", 4807850],
    ["Cote d'Ivoire", 3491, "60.33", 22701556],
    ["Croatia", 20260, "78", 4240317],
    ["Cuba", 21291, "78.5", 11389562],
    ["Cyprus", 29797, "82.6", 1165300],
    ["Czech Republic", 29437, "78.6", 10543186],
    ["Denmark", 43495, "80.1", 5669081],
    ["Djibouti", 3139, "64.63", 887861],
    ["Dominica", 10503, "74.6", 72680],
    ["Dominican Republic", 12837, "73.8", 10528391],
    ["Ecuador", 10996, "75.2", 16144363],
    ["Egypt", 11031, "71.3", 91508084],
    ["El Salvador", 7776, "74.1", 6126583],
    ["Equatorial Guinea", 31087, "60.63", 845060],
    ["Eritrea", 1129, "62.9", 5227791],
    ["Estonia", 26812, "76.8", 1312558],
    ["Ethiopia", 1520, "63.6", 99390750],
    ["Fiji", 7925, "66.3", 892145],
    ["Finland", 38923, "80.8", 5503457],
    ["France", 37599, "81.9", 64395345],
    ["Gabon", 18627, "60.53", 1725292],
    ["Gambia", 1644, "65.1", 1990924],
    ["Georgia", 7474, "73.3", 3999812],
    ["Germany", 44053, "81.1", 80688545],
    ["Ghana", 4099, "65.5", 27409893],
    ["Greece", 25430, "79.8", 10954617],
    ["Grenada", 11593, "71.7", 106825],
    ["Guatemala", 7279, "73.1", 16342897],
    ["Guinea", 1225, "60.8", 12608590],
    ["Guinea-Bissau", 1386, "53.4", 1844325],
    ["Guyana", 6816, "64.4", 767085],
    ["Haiti", 1710, "65.3", 10711067],
    ["Honduras", 4270, "72.4", 8075060],
    ["Hungary", 24200, "76.2", 9855023],
    ["Iceland", 42182, "82.8", 329425],
    ["India", 5903, "66.8", 1311050527],
    ["Indonesia", 10504, "70.9", 257563815],
    ["Iran", 15573, "78.5", 79109272],
    ["Iraq", 14646, "72.1", 36423395],
    ["Ireland", 47758, "80.4", 4688465],
    ["Israel", 31590, "82.4", 8064036],
    ["Italy", 33297, "82.1", 59797685],
    ["Jamaica", 8606, "75.5", 2793335],
    ["Japan", 36162, "83.5", 126573481],
    ["Jordan", 11752, "78.3", 7594547],
    ["Kazakhstan", 23468, "68.2", 17625226],
    ["Kenya", 2898, "66.63", 46050302],
    ["Kiribati", 1824, "62.4", 112423],
    ["Kuwait", 82633, "80.7", 3892115],
    ["Kyrgyz Republic", 3245, "69", 5939962],
    ["Lao", 5212, "66.4", 6802023],
    ["Latvia", 23282, "75.7", 1970503],
    ["Lebanon", 17050, "78.5", 5850743],
    ["Lesotho", 2598, "48.5", 2135022],
    ["Liberia", 958, "63.9", 4503438],
    ["Libya", 17261, "76.2", 6278438],
    ["Lithuania", 26665, "75.4", 2878405],
    ["Luxembourg", 88314, "81.1", 567110],
    ["Macedonia, FYR", 12547, "77", 2078453],
    ["Madagascar", 1400, "64.7", 24235390],
    ["Malawi", 799, "60.22", 17215232],
    ["Malaysia", 24320, "75.1", 30331007],
    ["Maldives", 14408, "79.5", 363657],
    ["Mali", 1684, "57.6", 17599694],
    ["Malta", 30265, "82.1", 418670],
    ["Marshall Islands", 3661, "65.1", 52993],
    ["Mauritania", 3877, "65.7", 4067564],
    ["Mauritius", 18350, "73.9", 1273212],
    ["Mexico", 16850, "74.5", 127017224],
    ["Micronesia, Fed. Sts.", 3510, "67", 104460],
    ["Moldova", 4896, "72.7", 4068897],
    ["Mongolia", 11819, "65.3", 2959134],
    ["Montenegro", 14833, "75.8", 625781],
    ["Morocco", 7319, "74.7", 34377511],
    ["Mozambique", 1176, "56.4", 27977863],
    ["Myanmar", 4012, "67.9", 53897154],
    ["Namibia", 10040, "61", 2458830],
    ["Nepal", 2352, "71.2", 28513700],
    ["Netherlands", 45784, "80.6", 16924929],
    ["New Zealand", 34186, "80.6", 4528526],
    ["Nicaragua", 4712, "76.8", 6082032],
    ["Niger", 943, "62.2", 19899120],
    ["Nigeria", 5727, "61.33", 182201962],
    ["North Korea", 1390, "71.4", 25155317],
    ["Norway", 64304, "81.6", 5210967],
    ["Oman", 48226, "75.7", 4490541],
    ["Pakistan", 4743, "66.5", 188924874],
    ["Panama", 20485, "78.2", 3929141],
    ["Papua New Guinea", 2529, "60.6", 7619321],
    ["Paraguay", 8219, "73.9", 6639123],
    ["Peru", 11903, "77.5", 31376670],
    ["Philippines", 6876, "70.2", 100699395],
    ["Poland", 24787, "77.3", 38611794],
    ["Portugal", 26437, "79.8", 10349803],
    ["Qatar", 132877, "82", 2235355],
    ["Romania", 19203, "76.8", 19511324],
    ["Russia", 23038, "73.13", 143456918],
    ["Rwanda", 1549, "66.53", 11609666],
    ["Samoa", 5558, "72.2", 193228],
    ["Sao Tome and Principe", 3003, "68.8", 190344],
    ["Saudi Arabia", 52469, "78.1", 31540372],
    ["Senegal", 2251, "66.1", 15129273],
    ["Serbia", 12908, "78.1", 8850975],
    ["Seychelles", 25684, "73.7", 96471],
    ["Sierra Leone", 2085, "58.5", 6453184],
    ["Singapore", 80794, "82.1", 5603740],
    ["Slovak Republic", 27204, "76.4", 5426258],
    ["Slovenia", 28550, "80.2", 2067526],
    ["Solomon Islands", 2047, "64.1", 583591],
    ["Somalia", 624, "58.7", 10787104],
    ["South Africa", 12509, "63.72", 54490406],
    ["South Korea", 34644, "80.7", 50293439],
    ["South Sudan", 3047, "58", 12339812],
    ["Spain", 32979, "81.7", 46121699],
    ["Sri Lanka", 10624, "76.5", 20715010],
    ["St. Lucia", 9997, "74.5", 184999],
    ["St. Vincent and the Grenadines", 10435, "72.9", 109462],
    ["Sudan", 3975, "69.5", 40234882],
    ["Suriname", 17125, "70.5", 542975],
    ["Swaziland", 6095, "51.5", 1286970],
    ["Sweden", 44892, "82", 9779426],
    ["Switzerland", 56118, "82.9", 8298663],
    ["Syria", 4637, "70.26", 18502413],
    ["Tajikistan", 2582, "71", 8481855],
    ["Tanzania", 2571, "63.43", 53470420],
    ["Thailand", 14512, "75.1", 67959359],
    ["Timor-Leste", 2086, "72.4", 1184765],
    ["Togo", 1433, "64.23", 7304578],
    ["Tonga", 5069, "70.5", 106170],
    ["Trinidad and Tobago", 30113, "71.4", 1360088],
    ["Tunisia", 11126, "77.3", 11253554],
    ["Turkey", 19360, "76.5", 78665830],
    ["Turkmenistan", 15865, "67.9", 5373502],
    ["Uganda", 1680, "60.8", 39032383],
    ["Ukraine", 8449, "72.1", 44823765],
    ["United Arab Emirates", 60749, "76.6", 9156963],
    ["United Kingdom", 38225, "81.4", 64715810],
    ["United States", 53354, "79.1", 321773631],
    ["Uruguay", 20438, "77.3", 3431555],
    ["Uzbekistan", 5598, "70.1", 29893488],
    ["Vanuatu", 2912, "65", 264652],
    ["Venezuela", 15753, "75.8", 31108083],
    ["Vietnam", 5623, "76.5", 93447601],
    ["West Bank and Gaza", 4319, "75.2", 4668466],
    ["Yemen", 3887, "67.6", 26832215],
    ["Zambia", 4034, "58.96", 16211767],
    ["Zimbabwe", 1801, "60.01", 15602751]
  ],
  emojis: [["animal", "count"], ["🐄", 9], ["🐖", 12], ["🐏", 3]],
  telescopes: [
    ["Name", "Type", "Url", "Location", "OperatedBy", "FundedBy"],
    ["Hubble Space Telescope", "Space Telescope", "https://en.wikipedia.org/wiki/Hubble_Space_Telescope", "Space", "NASA", "NASA"],
    ["LIGO Hanford", "Gravity Wave Observatory", "https://www.ligo.caltech.edu/WA", "Richland, WA, USA", "Caltech", "National Science Foundation"],
    ["LIGO Livingston", "Gravity Wave Observatory", "https://www.ligo.caltech.edu/LA", "Livingston, LA, USA", "MIT", "National Science Foundation"],
    [
      "Gran Telescopio Canarias (GTC)",
      "Astronomical Observatory",
      "http://www.gtc.iac.es/gtc/gtc.php",
      "La Palma, Garafía, Spain ",
      "IAC",
      "Observatorio Astronómico de Canarias, National Autonomous University of Mexico, University of Florida Edit this on Wikidata"
    ],
    [
      "Hobby–Eberly Telescope",
      "Astronomical Observatory",
      "http://mcdonaldobservatory.org/research/telescopes/HET",
      "Davis Mountains, Texas, US",
      "Stanford University & Ludwig Maximilians University of Munich and Georg August University of Göttingen",
      "YarCom Inc. and the Lott family "
    ]
  ],
  markdown: [
    ["text"],
    [
      `# My header
## My subheader
Hello world`
    ]
  ],
  webPages: [["name", "url"]],
  outerSpace: [
    ["text"],
    [
      `universe
 galaxies
  milkyWay
   solarSystems
    solarSystem
     stars
      sun
     planets
      mercury
      venus
      earth
       moons
        moon
      mars
      jupiter
      saturn
      uranus
      neptune
      pluto`
    ]
  ],
  wordCounts: [
    ["word", "count"],
    ["Two", 2],
    ["roads", 2],
    ["diverged", 2],
    ["in", 3],
    ["a", 3],
    ["yellow", 1],
    ["wood", 2],
    ["And", 6],
    ["sorry", 1],
    ["I", 9],
    ["could", 2],
    ["not", 1],
    ["travel", 1],
    ["both", 2],
    ["be", 2],
    ["one", 3],
    ["traveler", 1],
    ["long", 1],
    ["stood", 1],
    ["looked", 1]
  ],
  treeProgram: [
    ["source"],
    [
      `samples.iris
 group.by Species
  tables.basic
 columns.first 3`
    ]
  ],
  poem: [
    ["text"],
    [
      `Two roads diverged in a yellow wood,
And sorry I could not travel both
And be one traveler, long I stood
And looked down one as far as I could
To where it bent in the undergrowth;

Then took the other, as just as fair,
And having perhaps the better claim,
Because it was grassy and wanted wear;
Though as for that the passing there
Had worn them really about the same,

And both that morning equally lay
In leaves no step had trodden black.
Oh, I kept the first for another day!
Yet knowing how way leads on to way,
I doubted if I should ever come back.

I shall be telling this with a sigh
Somewhere ages and ages hence:
Two roads diverged in a wood, and I—
I took the one less traveled by,
And that has made all the difference.`
    ]
  ],
  playerGoals: [["PlayerGoals", "Goals"], ["Player1", 11], ["Player2", 2], ["Player3", 2], ["Player4", 2], ["Player5", 7]],
  patients: [["Patient", "Gender", "Weight"], ["Patient1", "Girl", "3.31"], ["Patient2", "Male", "2.8"], ["Patient3", "Male", "3.7"], ["Patient4", "Girl", "2.5"], ["Patient5", "Girl", "2.8"]],
  regionalMarkets: [
    ["Location", "Parent", "Market trade volume (size)", "Market increase/decrease (color)"],
    ["Global", null, 0, 0],
    ["America", "Global", 0, 0],
    ["Europe", "Global", 0, 0],
    ["Asia", "Global", 0, 0],
    ["Australia", "Global", 0, 0],
    ["Africa", "Global", 0, 0],
    ["Brazil", "America", 11, 10],
    ["USA", "America", 52, 31],
    ["Mexico", "America", 24, 12],
    ["Canada", "America", 16, -23],
    ["France", "Europe", 42, -11],
    ["Germany", "Europe", 31, -2],
    ["Sweden", "Europe", 22, -13],
    ["Italy", "Europe", 17, 4],
    ["UK", "Europe", 21, -5],
    ["China", "Asia", 36, 4],
    ["Japan", "Asia", 20, -12],
    ["India", "Asia", 40, 63],
    ["Laos", "Asia", 4, 34],
    ["Mongolia", "Asia", 1, -5],
    ["Israel", "Asia", 12, 24],
    ["Iran", "Asia", 18, 13],
    ["Pakistan", "Asia", 11, -52],
    ["Egypt", "Africa", 21, 0],
    ["S. Africa", "Africa", 30, 43],
    ["Sudan", "Africa", 12, 2],
    ["Congo", "Africa", 10, 12],
    ["Zaire", "Africa", 8, 10]
  ],
  stockPrice: [
    ["Step", "Price"],
    [0, 0],
    [1, 10],
    [2, 23],
    [3, 17],
    [4, 18],
    [5, 9],
    [6, 11],
    [7, 27],
    [8, 33],
    [9, 40],
    [10, 32],
    [11, 35],
    [12, 30],
    [13, 40],
    [14, 42],
    [15, 47],
    [16, 44],
    [17, 48],
    [18, 52],
    [19, 54],
    [20, 42],
    [21, 55],
    [22, 56],
    [23, 57],
    [24, 60],
    [25, 50],
    [26, 52],
    [27, 51],
    [28, 49],
    [29, 53],
    [30, 55],
    [31, 60],
    [32, 61],
    [33, 59],
    [34, 62],
    [35, 65],
    [36, 62],
    [37, 58],
    [38, 55],
    [39, 61],
    [40, 64],
    [41, 65],
    [42, 63],
    [43, 66],
    [44, 67],
    [45, 69],
    [46, 69],
    [47, 70],
    [48, 72],
    [49, 68],
    [50, 66],
    [51, 65],
    [52, 67],
    [53, 70],
    [54, 71],
    [55, 72],
    [56, 73],
    [57, 75],
    [58, 70],
    [59, 68],
    [60, 64],
    [61, 60],
    [62, 65],
    [63, 67],
    [64, 68],
    [65, 69],
    [66, 70],
    [67, 72],
    [68, 75],
    [69, 80]
  ]
}
window.DummyDataSets = DummyDataSets
//onsave jtree build produce jtable.browser.js
//onsave jtree build produce jtable.node.js
class PivotTable {
  constructor(rows, inputColumns, outputColumns) {
    this._columns = {}
    this._rows = rows
    inputColumns.forEach(col => (this._columns[col.name] = col))
    outputColumns.forEach(col => (this._columns[col.name] = col))
  }
  _getGroups(allRows, groupByColNames) {
    const rowsInGroups = new Map()
    allRows.forEach(row => {
      const groupKey = groupByColNames.map(col => row[col].toString().replace(/ /g, "")).join(" ")
      if (!rowsInGroups.has(groupKey)) rowsInGroups.set(groupKey, [])
      rowsInGroups.get(groupKey).push(row)
    })
    return rowsInGroups
  }
  getNewRows(groupByCols) {
    // make new trees
    const rowsInGroups = this._getGroups(this._rows, groupByCols)
    // Any column in the group should be reused by the children
    const columns = [
      {
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
      const newRow = {}
      groupByCols.forEach(col => {
        newRow[col] = firstRow ? firstRow[col] : 0
      })
      newRow.count = group.length
      // todo: add more reductions? count, stddev, median, variance.
      colsToReduce.forEach(col => {
        const sourceColName = col.source
        const values = group.map(row => row[sourceColName]).filter(val => typeof val === "number" && !isNaN(val))
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
    // todo: add tests. figure out this api better.
    Object.values(columns).forEach(col => {
      // For pivot columns, remove the source and reduction info for now. Treat things as immutable.
      delete col.source
      delete col.reduction
    })
    return {
      rows: newRows,
      columns
    }
  }
}
var ComparisonOperators
;(function(ComparisonOperators) {
  ComparisonOperators["lessThan"] = "<"
  ComparisonOperators["greaterThan"] = ">"
  ComparisonOperators["lessThanOrEqual"] = "<="
  ComparisonOperators["greaterThanOrEqual"] = ">="
  ComparisonOperators["equal"] = "="
  ComparisonOperators["notEqual"] = "!="
})(ComparisonOperators || (ComparisonOperators = {}))
// todo: remove detectAndAddParam?
// todo: remove rowclass param?
class Table {
  constructor(rowsArray = [], columnsArrayOrMap = [], rowClass = Row, detectAndAddColumns = true, samplingSeed = Date.now()) {
    this._columnsMap = {}
    this._ctime = new jtree.TreeNode()._getProcessTimeInMilliseconds()
    this._tableId = this._getUniqueId()
    this._samplingSeed = samplingSeed
    // if this is ALREADY CARDS, should we be a view?
    this._rows = rowsArray.map(source => (source instanceof Row ? source : new rowClass(source, this)))
    // Add detected columns first, so they can be overwritten
    if (detectAndAddColumns) this._getDetectedColumnNames().forEach(col => this._registerColumn({ name: col }))
    if (Array.isArray(columnsArrayOrMap)) columnsArrayOrMap.forEach(col => this._registerColumn(col))
    else if (columnsArrayOrMap) this._columnsMap = columnsArrayOrMap
  }
  _getUniqueId() {
    Table._uniqueId++
    return Table._uniqueId
  }
  _registerColumn(col) {
    this._columnsMap[col.name] = new Column(col, this._getColumnValuesFromSourceAsAnyVector(col.source || col.name))
    return this
  }
  _getColumnValuesFromSourceAsAnyVector(columnName) {
    return this.getRows().map(row => row.getRowOriginalValue(columnName))
  }
  // todo: ADD TYPINGS
  _predictColumns(predictionHints, propertyNameToColumnNameMap = {}) {
    // todo: use the available input table column names, coupled with column setting we are trying to predict.
    // ie: "gender" should use "gender" col, if available
    // check all the columns for one that matches all tests. if found, return it.
    const columnsArray = this.getColumnsArray()
    const tests = predictionHints.split(",")
    const filterTests = tests.filter(test => test.includes("=")).map(test => test.split("="))
    const filterFn = col => filterTests.every(test => col[test[0]] !== undefined && col[test[0]]().toString() === test[1])
    let colsThatPassed = columnsArray.filter(col => filterFn(col))
    const notIn = {}
    const notEqualTests = tests
      .filter(test => test.startsWith("!"))
      .map(test => propertyNameToColumnNameMap[test.substr(1)])
      .filter(identity => identity)
      .forEach(name => {
        notIn[name] = true
      })
    colsThatPassed = colsThatPassed.filter(col => !notIn[col.getColumnName()])
    // for now just 1 prop ranking.
    const rankColumn = tests.find(test => !test.includes("=") && !test.includes("!"))
    let potentialCols = colsThatPassed
    if (rankColumn) potentialCols = potentialCols.sort(jtree.Utils.makeSortByFn(col => col[rankColumn]())).reverse()
    return potentialCols
  }
  getRows() {
    return this._rows
  }
  getFirstColumnAsString() {
    return this.getRows()
      .map(row => row.getFirstValue())
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
  _getLowerCaseColumnsMap() {
    const map = {}
    Object.keys(this._columnsMap).forEach(key => (map[key.toLowerCase()] = key))
    return map
  }
  getTableCTime() {
    return this._ctime
  }
  filterClonedRowsByScalar(columnName, comparisonOperator, scalarValueAsString) {
    const column = this.getColumnByName(columnName)
    let typedScalarValue = column.getPrimitiveTypeObj().getAsNativeJavascriptType(scalarValueAsString)
    if (typedScalarValue instanceof Date) typedScalarValue = typedScalarValue.getTime() // todo: do I need this?
    return new Table(
      this.cloneNativeJavascriptTypedRows().filter(row => {
        let rowTypedValue = row[columnName]
        if (rowTypedValue instanceof Date) rowTypedValue = rowTypedValue.getTime() // todo: do I need this?
        if (comparisonOperator === ComparisonOperators.equal) return rowTypedValue == typedScalarValue
        if (comparisonOperator === ComparisonOperators.notEqual) return rowTypedValue != typedScalarValue
        if (comparisonOperator === ComparisonOperators.greaterThan) return rowTypedValue > typedScalarValue
        if (comparisonOperator === ComparisonOperators.lessThan) return rowTypedValue < typedScalarValue
        if (comparisonOperator === ComparisonOperators.lessThanOrEqual) return rowTypedValue <= typedScalarValue
        if (comparisonOperator === ComparisonOperators.greaterThanOrEqual) return rowTypedValue >= typedScalarValue
      }),
      this.getColumnsArrayOfObjects(),
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
  getJavascriptNativeTypedValues() {
    return this.getRows().map(row => row.rowToObjectWithOnlyNativeJavascriptTypes())
  }
  toMatrix() {
    return this.getRows().map(row => row.toVector())
  }
  toNumericMatrix() {
    // todo: right now it drops them. should we 1 hot them?
    const numericNames = this.getColumnsArray()
      .filter(col => col.isNumeric())
      .map(col => col.getColumnName())
    return this.getRows().map(row => {
      const obj = row.rowToObjectWithOnlyNativeJavascriptTypes()
      return numericNames.map(name => obj[name])
    })
  }
  clone() {
    return new Table(this.cloneNativeJavascriptTypedRows())
  }
  cloneNativeJavascriptTypedRows() {
    return this.getRows()
      .map(row => row.rowToObjectWithOnlyNativeJavascriptTypes())
      .map(obj => Object.assign({}, obj))
  }
  fillMissing(columnName, value) {
    const filled = this.cloneNativeJavascriptTypedRows().map(row => {
      if (jtree.Utils.isValueEmpty(row[columnName])) row[columnName] = value
      return row
    })
    return new Table(filled, this.getColumnsArrayOfObjects())
  }
  getTableColumnByName(name) {
    return this.getColumnsMap()[name]
  }
  _getUnionSample(sampleSet) {
    const sample = {}
    sampleSet.forEach(row => {
      row.getRowKeys().forEach(key => {
        if (!key) return
        const currentVal = sample[key]
        if (currentVal !== undefined && currentVal !== "") return
        sample[key] = row.getRowOriginalValue(key)
      })
    })
    return sample
  }
  _getSampleSet() {
    const SAMPLE_SET_SIZE = 30 // todo: fix.
    if (!this._sampleSet) this._sampleSet = jtree.Utils.sampleWithoutReplacement(this.getRows(), SAMPLE_SET_SIZE, this._samplingSeed)
    return this._sampleSet
  }
  _getDetectedColumnNames() {
    const columns = this.getColumnsMap()
    // This is run AFTER we have all user definied columns, and AFTER we have all data.
    // detect columns that appear in records
    // todo: this is broken. if you only pull 30, and its a tree or other type with varying columsn, you
    // will often miss columns.
    return Object.keys(this._getUnionSample(this._getSampleSet()))
      .map(columnName => columnName.trim()) // todo: why do we filter empties?
      .filter(identity => identity)
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
  _getColumnNamesAndTypes(withReductions = false) {
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
  getPredictionsForAPropertyNameToColumnNameMapGivenHintsNode(hintsNode, propertyNameToColumnNameMap) {
    const results = {}
    hintsNode
      .map(columnHintNode => this.getColumnNamePredictionsForProperty(columnHintNode.getFirstWord(), columnHintNode.getContent(), propertyNameToColumnNameMap))
      .filter(pred => pred.length)
      .forEach(predictions => {
        const topPrediction = predictions[0]
        results[topPrediction.propertyName] = topPrediction.columnName
      })
    return results
  }
  getColumnNamePredictionsForProperty(propertyName, predictionHints, propertyNameToColumnNameMap) {
    const userDefinedColumnName = propertyNameToColumnNameMap[propertyName]
    if (this.getColumnsMap()[userDefinedColumnName]) return [{ propertyName: propertyName, columnName: userDefinedColumnName }] // Table has a column named this, return okay.
    // Table has a lowercase column named this. Return okay. Todo: do we want to do this?
    if (userDefinedColumnName && this._getLowerCaseColumnsMap()[userDefinedColumnName.toLowerCase()]) return [this._getLowerCaseColumnsMap()[userDefinedColumnName.toLowerCase()]]
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
    return new jtree.TreeNode(this.getRows().map(row => row.getRowSourceObject()))
  }
  filterRowsByFn(fn) {
    return new Table(this.cloneNativeJavascriptTypedRows().filter((inputRow, index) => fn(inputRow, index)))
  }
  // todo: make more efficient?
  // todo: preserve columns
  addColumns(columnsToAdd) {
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
  changeColumnType(columnName, newType) {
    const cols = this.getColumnsArrayOfObjects()
    cols.forEach(col => {
      if (col.name === columnName) col.type = newType
    })
    return new Table(this.cloneNativeJavascriptTypedRows(), cols, undefined, false)
  }
  renameColumns(nameMap) {
    const rows = this.getRows()
      .map(row => row.rowToObjectWithOnlyNativeJavascriptTypes())
      .map(obj => {
        Object.keys(nameMap).forEach(oldName => {
          const newName = nameMap[oldName]
          if (newName === oldName) return
          obj[newName] = obj[oldName]
          delete obj[oldName]
        })
        return obj
      })
    const cols = this.getColumnsArrayOfObjects()
    cols.forEach(col => {
      if (nameMap[col.name]) col.name = nameMap[col.name]
    })
    return new Table(rows, cols, undefined, false)
  }
  cloneWithCleanColumnNames() {
    const nameMap = {}
    const cols = this.getColumnsArrayOfObjects()
    cols.forEach(col => {
      nameMap[col.name] = col.name.replace(/[^a-z0-9]/gi, "")
    })
    return this.renameColumns(nameMap)
  }
  // todo: can be made more effcicent
  dropAllColumnsExcept(columnsToKeep) {
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
  addRow(rowWords) {
    const rows = this.cloneNativeJavascriptTypedRows()
    const newRow = {}
    Object.keys(rows[0] || {}).forEach((key, index) => {
      // todo: handle typings
      newRow[key] = rowWords[index]
    })
    rows.push(newRow)
    return new Table(rows, this.getColumnsMap())
  }
  _synthesizeRow(randomNumberFn) {
    const row = {}
    this.getColumnsArray().forEach(column => {
      row[column.getColumnName()] = column.synthesizeValue(randomNumberFn)
    })
    return row
  }
  synthesizeTable(rowcount, seed) {
    const randomNumberFn = jtree.Utils.makeSemiRandomFn(seed)
    const rows = []
    while (rowcount) {
      rows.push(this._synthesizeRow(randomNumberFn))
      rowcount--
    }
    return new Table(rows, this.getColumnsArray().map(col => col.toObject()))
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
  makePivotTable(groupByColumnNames, newCols) {
    const inputColumns = this.getColumnsArrayOfObjects()
    const colMap = {}
    inputColumns.forEach(col => (colMap[col.name] = true))
    const groupByCols = groupByColumnNames.filter(col => colMap[col])
    const pivotTable = new PivotTable(this.getJavascriptNativeTypedValues(), inputColumns, newCols).getNewRows(groupByCols)
    return new Table(pivotTable.rows, pivotTable.columns)
  }
  sortBy(colNames) {
    const colAccessorFns = colNames.map(colName => row => row.rowToObjectWithOnlyNativeJavascriptTypes()[colName])
    const rows = this.getRows().sort(jtree.Utils.makeSortByFn(colAccessorFns))
    return new Table(rows, this.getColumnsMap())
  }
  toDelimited(delimiter) {
    return this.toTree().toDelimited(delimiter, this.getColumnNames())
  }
  toSimpleSchema() {
    return this.getColumnsArray()
      .map(col => `${col.getColumnName()} ${col.getPrimitiveTypeName()}`)
      .join("\n")
  }
  // todo: toProtoBuf, toSQLite, toJsonSchema, toJsonLd, toCapnProto, toApacheArrow, toFlatBuffers
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
}
Table._uniqueId = 0
window.Table = Table
window.ComparisonOperators = ComparisonOperators
