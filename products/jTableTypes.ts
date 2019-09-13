namespace jTableTypes {
  export declare type int = number
  export declare type float = number
  export declare type positiveInt = int
  export declare type columnName = string
  export declare type treeNode = any

  export declare type now = float
  export declare type probability = float

  export declare type nounClasses = string
  export declare type nounType = string

  export declare type rawRowJavascriptObject = Object

  export declare type displayFormat = string

  export declare type columnTitle = string
  export declare type reductionType = "count" | "sum" | "mean" | "min" | "max" | "median"

  export declare type javascriptNativeType = number | string | Date | boolean

  export interface columnDefinitionObject {
    name?: columnName
    reduction?: reductionType
    type?: primitiveType
    title?: columnTitle
    format?: displayFormat
    source?: columnName
    mathFn?: Function
    accessorFn?: (row: any) => any
    titlePotential?: probability
    isString?: boolean
    isTemporal?: boolean
    isLink?: boolean
    vegaType?: string
    vegaTimeUnit?: string
    estimatedTextLength?: positiveInt
    min?: number
  }

  export declare type moment = any

  export interface jsonParseAttempt {
    ok: boolean
    result?: any
  }

  export declare type vegaYearTimeUnit =
    | "year"
    | "yearquarter"
    | "yearquartermonth"
    | "yearmonth"
    | "yearmonthdate"
    | "yearmonthdatehours"
    | "yearmonthdatehoursminutes"
    | "yearmonthdatehoursminutesseconds"
  export declare type vegaQuarterTimeUnit = "quarter" | "quartermonth"
  export declare type vegaMonthTimeUnit = "month" | "monthdate"
  export declare type vegaDateTimeUnit = "date" // (Day of month, i.e., 1 - 31)
  export declare type vegaDayTimeUnit = "day" // (Day of week, i.e., Monday - Friday)
  export declare type vegaHoursTimeUnit = "hours" | "hoursminutes" | "hoursminutesseconds"
  export declare type vegaMinutesTimeUnit = "minutes" | "minutesseconds"
  export declare type vegaSecondsTimeUnit = "seconds" | "secondsmilliseconds"
  export declare type vegaMillisecondsTimeUnit = "milliseconds"

  export declare type vegaTimeUnit =
    | vegaYearTimeUnit
    | vegaQuarterTimeUnit
    | vegaMonthTimeUnit
    | vegaDateTimeUnit
    | vegaDayTimeUnit
    | vegaHoursTimeUnit
    | vegaMinutesTimeUnit
    | vegaSecondsTimeUnit
    | vegaMillisecondsTimeUnit

  export declare type entropy = positiveInt // I belive this is just how many options in domain

  export declare type predictionHintsString = string

  export interface columnNamePrediction {
    columnName: columnName
    propertyName: string
  }

  export declare type propertyNameToColumnNameMap = { [propertyName: string]: columnName }

  // todo: not sure what types to support here
  // todo: add booleans
  export declare type objectWithOnlyNativeJavascriptTypes = { [columnName: string]: javascriptNativeType }

  export declare type sourceObject = any

  export interface valueCounts {
    count: positiveInt
    index: positiveInt
  }

  // todo: does this work only for numbers? or do we support text too?
  export interface reductionResult {
    incompleteCount?: positiveInt
    uniqueValues?: positiveInt
    count?: positiveInt
    sum?: number
    median?: number
    mean?: number
    min?: number
    max?: number
    range?: number
    mode?: number
    modeSize?: number
    deciles?: { [decile: number]: number }
  }

  export interface tableInputs {
    rows: rawRowJavascriptObject[]
    columnDefinitions?: columnDefinitionObject[]
  }

  // todo: needs to sync with primitiveType
  export interface primitiveTypeGuess {
    number?: probability
    date?: probability
    string?: probability
    feet?: probability
    object?: probability
    boolean?: probability
    usd?: probability
    millisecond?: probability
    year?: probability
    second?: probability
  }

  // Continent, city, percent, duration (seconds), lots of currencies, lat/long, region, metro

  export declare type primitiveType =
    | "millisecond"
    | "second"
    | "date"
    | "day"
    | "week"
    | "month"
    | "monthDay"
    | "hour"
    | "hourMinute"
    | "minute"
    | "year"
    | "feet"
    | "usd"
    | "number"
    | "numberString"
    | "string"
    | "text"
    | "path"
    | "dir"
    | "code"
    | "html"
    | "url"
    | "object"
    | "boolean"
    | "int"

  export declare type countMap = Map<any, valueCounts>

  export interface summaryVector {
    map: countMap
    values: any[]
    incompleteCount: positiveInt
    uniqueValues: positiveInt
  }
}

export { jTableTypes }
