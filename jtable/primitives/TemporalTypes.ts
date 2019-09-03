const moment = require("moment")
const parseFormat = require("moment-parseformat")

import { AbstractPrimitiveType } from "./AbstractPrimitiveType"
import { jTableTypes } from "../../worldWideTypes/jTableTypes"
import { Metrics } from "../Metrics"
import { VegaTypes, JavascriptNativeTypeNames } from "../JTableConstants"

// https://github.com/gentooboontoo/js-quantities
moment.createFromInputFallback = function(momentConfig) {
  momentConfig._d = new Date(momentConfig._i)
}

interface TemporalType {
  _fromNumericToDate(value: number): Date
  _fromStringToDate(value: string): Date
  getVegaTimeUnit(): jTableTypes.vegaTimeUnit
}

abstract class AbstractTemporal extends AbstractPrimitiveType implements TemporalType {
  _fromStringToDate(value) {
    return moment(parseInt(value)).toDate()
  }

  getAsNativeJavascriptType(val: any): Date | number {
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

  _fromNumericToDate(value: number): jTableTypes.moment {
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
    return Metrics.getDate(value).unix() * 1000
  }

  _fromStringToDate(value) {
    return Metrics.getDate(value).toDate()
  }

  getProbForColumnSpecimen(value) {
    const isValid = Metrics.getDate(value).isValid()
    return isValid
  }

  getStringExamples() {
    return ["01/01/01"]
  }
}

// Beginning of day
class Day extends AbstractTemporal {
  toDisplayString(value, format) {
    return moment(value).format(format || "MM/DD/YYYY")
  }
  fromStringToNumeric(value) {
    return (
      Metrics.getDate(value)
        .startOf("day")
        .unix() * 1000
    )
  }

  getVegaTimeUnit() {
    return undefined
  }

  _fromStringToDate(value) {
    return Metrics.getDate(value)
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
    return parseFloat(Metrics.getDate(value).format("H.m"))
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
  toDisplayString(value, format) {
    return moment(value).format("m")
  }
  fromStringToNumeric(value) {
    return (
      Metrics.getDate(value)
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
    return <jTableTypes.vegaTimeUnit>"seconds"
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
    return <jTableTypes.vegaTimeUnit>"quartermonth"
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
    return <jTableTypes.vegaTimeUnit>"month"
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
    return <jTableTypes.vegaTimeUnit>"monthdate"
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
    return <jTableTypes.vegaTimeUnit>"hours"
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
  getVegaTimeUnit(): jTableTypes.vegaTimeUnit {
    return "milliseconds"
  }
}

class Second extends AbstractMillisecond {
  fromStringToNumeric(value) {
    return parseInt(value) * 1000
  }

  getVegaTimeUnit(): jTableTypes.vegaTimeUnit {
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

export { DateCol, Day, Minute, HourMinute, Second, MilliSecond, Year, Week, MonthDay, Month, Hour, AbstractTemporal }
