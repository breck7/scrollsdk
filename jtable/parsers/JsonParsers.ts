const { jtree } = require("../../index.js")

import { TableParserIds } from "../JTableConstants"

import { RowStringSpecimen } from "./RowStringSpecimen"
import { AbstractTableParser } from "./AbstractTableParser"

abstract class AbstractJsonParser extends AbstractTableParser {
  getParserId() {
    return TableParserIds.json
  }

  getProbForRowSpecimen(specimen: RowStringSpecimen) {
    return 0
  }

  getExample() {
    return JSON.stringify([{ name: "joe", age: 2 }, { name: "mike", age: 4 }])
  }

  _parseTableInputsFromString(str: string) {
    const obj = JSON.parse(str)
    return { rows: obj instanceof Array ? obj : [obj] }
  }
}

class JsonParser extends AbstractJsonParser {}

abstract class AbstractJsonArrayParser extends AbstractJsonParser {
  getExample() {
    return JSON.stringify([{ name: "jane", age: 33 }, { name: "bill", age: 25 }])
  }

  getProbForRowSpecimen(specimen: RowStringSpecimen): number {
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

  _parseTableInputsFromString(str: string) {
    return { rows: jtree.Utils.javascriptTableWithHeaderRowToObjects(JSON.parse(str)) }
  }

  getParserId() {
    return TableParserIds.jsonDataTableWithHeader
  }

  getProbForRowSpecimen(specimen: RowStringSpecimen): number {
    const result = specimen.getParsedJsonAttemptResult()
    if (!result.ok) return 0

    if (JsonDataTableWithHeaderParser.isJavaScriptDataTable(result.result)) return 0.99

    return 0.001
  }

  static isJavaScriptDataTable(obj: any) {
    const isAnArray = obj instanceof Array
    if (!isAnArray) return false
    const isAnArrayOfArrays = obj.every((row: any) => row instanceof Array)
    if (!isAnArrayOfArrays) return false

    if (obj.length < 3) return false

    const firstRowTypes = obj[0].map((item: any) => typeof item === "string").join(" ")
    const secondRowTypes = obj[1].map((item: any) => typeof item === "string").join(" ")
    const thirdRowTypes = obj[2].map((item: any) => typeof item === "string").join(" ")
    const firstRowIsJustStrings = !firstRowTypes.replace(/true/g, "").trim()
    if (secondRowTypes === thirdRowTypes && secondRowTypes !== firstRowTypes && firstRowIsJustStrings) return true
    return false
  }
}

abstract class AbstractJsonObjectParser extends AbstractJsonParser {
  getProbForRowSpecimen(specimen: any): number {
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

  _parseTableInputsFromString(str: string) {
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

  getProbForRowSpecimen(specimen: any) {
    const result = specimen.getParsedJsonAttemptResult()
    if (!result.ok) return 0

    if (!(result.result instanceof Array)) return 0
    return result.result.filter((item: any) => item && typeof item === "object" && item.hasOwnProperty).length === 0 ? 1 : 0

    return 0
  }

  _parseTableInputsFromString(str: string) {
    return {
      rows: JSON.parse(str).map((num: any) => {
        return { value: num }
      })
    }
  }
}

class JsonCountMapParser extends AbstractJsonObjectParser {
  getParserId() {
    return TableParserIds.jsonCounts
  }

  getProbForRowSpecimen(specimen: any) {
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

  _parseTableInputsFromString(str: string) {
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

export { JsonParser, JsonArrayParser, JsonDataTableWithHeaderParser, JsonVectorParser, JsonMapParser, JsonCountMapParser }
