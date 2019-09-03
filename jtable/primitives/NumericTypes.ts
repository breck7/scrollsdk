import * as numeral from "numeral"

import { jTableTypes } from "../../worldWideTypes/jTableTypes"
import { AbstractPrimitiveType } from "./AbstractPrimitiveType"

import { Metrics } from "../Metrics"

import { VegaTypes, JavascriptNativeTypeNames } from "../JTableConstants"

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
    return isNaN(Metrics.feetToInches(sample)) ? 0 : 1
  }
  fromStringToNumeric(val) {
    return Metrics.feetToInches(val)
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
}

abstract class AbstractCurrency extends AbstractNumeric {}

class USD extends AbstractCurrency {
  toDisplayString(value, format) {
    return format ? numeral(value).format(format) : value
  }

  fromStringToNumeric(value) {
    return parseFloat(value.toString().replace(/[\$\, \%]/g, ""))
  }
  getProbForColumnSpecimen(sample) {
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
  toDisplayString(value, format) {
    if (format === "percent") return numeral(parseFloat(value)).format("0.00") + "%"

    // Need the isNan bc numeral will throw otherwise
    if (format && !isNaN(value) && value !== Infinity) return numeral(value).format(format)

    return value
  }
  getDefaultFormat(columnName, sample) {
    if (columnName.match(/^(mile|pound|inch|feet)s?$/i)) return "0.0"

    if (columnName.match(/^(calorie|steps)s?$/i)) return "0,0"

    if (sample && !sample.toString().includes(".")) return "0,0"
  }

  getStringExamples() {
    return ["2.22"]
  }
}

class NumberString extends AbstractNumeric {
  toDisplayString(value, format) {
    return format ? numeral(value).format(format) : value
  }
  getDefaultFormat() {
    return "0,0"
  }
  fromStringToNumeric(str) {
    return parseFloat(str.toString().replace(/[\$\, \%]/g, ""))
  }

  getStringExamples() {
    return ["2,000"]
  }
}

export { IntType, Feet, USD, NumberCol, NumberString }
