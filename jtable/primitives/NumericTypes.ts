import * as d3format from "d3-format"

import { jTableTypes } from "../../worldWideTypes/jTableTypes"
import { AbstractPrimitiveType } from "./AbstractPrimitiveType"

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

export { IntType, Feet, USD, NumberCol, NumberString }
