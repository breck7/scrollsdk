const moment = require("moment")
const parseFormat = require("moment-parseformat")

import { AbstractPrimitiveType } from "./AbstractPrimitiveType"
import { jTableTypes } from "../../worldWideTypes/jTableTypes"
import { VegaTypes, JavascriptNativeTypeNames } from "../JTableConstants"

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

export { DateCol, Day, Minute, HourMinute, Second, MilliSecond, Year, Week, MonthDay, Month, Hour, AbstractTemporal }
