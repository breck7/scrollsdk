//onsave jtree build produce jtable.browser.js
//onsave jtree build produce jtable.node.js

const { jtree } = require("../index.js")

import { jTableTypes } from "../products/jTableTypes"

enum TableParserIds {
  csv = "csv",
  ssv = "ssv",
  psv = "psv",
  tsv = "tsv",
  xml = "xml",
  html = "html",
  spaced = "spaced",
  tree = "tree",
  treeRows = "treeRows",
  sections = "sections",
  txt = "txt",
  list = "list",
  text = "text",
  jsonVector = "jsonVector",
  json = "json",
  jsonDataTableWithHeader = "jsonDataTableWithHeader",
  jsonMap = "jsonMap",
  jsonCounts = "jsonCounts"
}

// todo: detect mixed format, like a csv file with a header. and then suggest ignore that part, or splitting it out?
// maybe we could split a string into sections, and say "we've detected 3 sections, which one do you want to use"?

// todo: split csv into normal csv and advanced delimited.

// todo: allow for metadata like filename and filetype header

class RowStringSpecimen {
  constructor(str: string) {
    const trimmedStr = str.trim()
    const lines = trimmedStr.split(/\n/g)
    const firstLine = lines[0]

    const strCount = (str: string, reg: RegExp) => (str.match(reg) || []).length

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

  private _parsedJsonObject: jTableTypes.jsonParseAttempt
  public trimmedStr: string
  public lines: string[]
  public firstLine: string
  public lineCount: jTableTypes.int
  public indentedLineCount: jTableTypes.int
  public blankLineCount: jTableTypes.int
  public commaCount: jTableTypes.int
  public tabCount: jTableTypes.int
  public verticalBarCount: jTableTypes.int
  public firstLineCommaCount: jTableTypes.int
  public firstLineTabCount: jTableTypes.int
  public firstLineSpaceCount: jTableTypes.int
  public firstLineVerticalBarCount: jTableTypes.int
}

abstract class AbstractTableParser {
  isNodeJs() {
    return typeof exports !== "undefined"
  }

  abstract getProbForRowSpecimen(specimen: RowStringSpecimen): jTableTypes.probability
  abstract getExample(): string
  abstract getParserId(): string
  abstract _parseTableInputsFromString(str: string): jTableTypes.tableInputs
}

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

// todo: remove?
abstract class AbstractJTreeTableParser extends AbstractTableParser {
  _parseTableInputsFromString(str: string) {
    return {
      rows: this._parseTrees(str)
        .filter((node: any) => node.length)
        .map((node: any) => node.toObject())
    }
  }

  protected _parseTrees(str: string): jTableTypes.treeNode[] {
    return []
  }
}

class CsvParser extends AbstractJTreeTableParser {
  getExample() {
    return `name,age,height
john,12,50`
  }

  _parseTrees(str: string) {
    return jtree.TreeNode.fromCsv(str)
  }

  getProbForRowSpecimen(specimen: any) {
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

  _parseTrees(str: string) {
    return jtree.TreeNode.fromTsv(str)
  }

  getProbForRowSpecimen(specimen: any) {
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

  _parseTrees(str: string) {
    return jtree.TreeNode.fromDelimited(str, "|", '"')
  }

  getProbForRowSpecimen(specimen: any) {
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

  _parseTrees(str: string) {
    return jtree.TreeNode.fromSsv(str)
  }

  getProbForRowSpecimen(specimen: any) {
    if (!specimen.firstLineSpaceCount) return 0
    if (specimen.blankLineCount) return 0.05
    return 0.11
  }
}

class XmlParser extends AbstractJTreeTableParser {
  getProbForRowSpecimen(specimen: any) {
    return specimen.trimmedStr.match(/^ *\</) ? 1 : 0
  }

  getExample() {
    return `<person>
 <name>bob</name><age>32</age></person>`
  }

  getParserId() {
    return TableParserIds.xml
  }

  _parseTrees(str: string) {
    // todo: fix this! Create an XML Tree Language
    if (this.isNodeJs()) return new jtree.TreeNode(str)
    return jtree.TreeNode.fromXml(str)
  }
}

class HtmlParser extends AbstractJTreeTableParser {
  getProbForRowSpecimen(specimen: any) {
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

  _parseTrees(str: string) {
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

  _parseTableInputsFromString(str: string) {
    // todo: get columns on first pass.
    const rows = new jtree.TreeNode(str)
    return {
      rows: rows.map((node: any) => node.toObject()),
      columnDefinitions: rows.getColumnNames().map((name: string) => {
        return { name: name }
      })
    }
  }

  getProbForRowSpecimen(specimen: any) {
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

  _parseTrees(str: any) {
    // todo: add tests. Detected value(s) or undefined subtrees, treating as object.
    const newTree = new jtree.TreeNode()
    newTree.pushContentAndChildren(undefined, str instanceof jtree.TreeNode ? str : new jtree.TreeNode(str))
    return newTree
  }

  getProbForRowSpecimen(specimen: any) {
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

  getProbForRowSpecimen(specimen: any) {
    if (specimen.blankLineCount > 10) return 0.95
    return 0.05
  }

  _parseTableInputsFromString(str: string) {
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
    names = names.map((name: string) => name.replace(/ /g, ""))

    for (let lineNumber = 0; lineNumber < lineCount; lineNumber = lineNumber + nodeCount) {
      const obj: any = {}
      names.forEach((col: string, index: number) => {
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

  _parseTableInputsFromString(str: string) {
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
      const obj: any = {}
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

  _parseTableInputsFromString(str: string) {
    return {
      rows: str.split(/\n/g).map((line: string, index: number) => {
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

  getProbForRowSpecimen(specimen: any) {
    if (specimen.blankLineCount) return 0.12
    return 0.05
  }

  _parseTableInputsFromString(str: string) {
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

  private _parsers: AbstractTableParser[]
  private _parserMap: { [tableParserId: string]: AbstractTableParser }

  getAllParsers() {
    return this._getParsersArray()
  }

  getAllTableParserIds() {
    return Object.keys(this._getParserMap())
  }

  getExample(parserId: TableParserIds) {
    return this._getParser(parserId).getExample()
  }

  private _getParser(parserId: TableParserIds) {
    const options = this._getParserMap()
    return options[parserId] || options.text // todo: surface an error.
  }

  private _getParserMap() {
    return this._parserMap
  }

  private _getParsersArray() {
    return this._parsers
  }

  // todo: remove this?
  parseTableInputsFromObject(data: any, parserId: TableParserIds): jTableTypes.tableInputs {
    if (data instanceof Array) {
      if (JsonDataTableWithHeaderParser.isJavaScriptDataTable(data)) return { rows: jtree.Utils.javascriptTableWithHeaderRowToObjects(data) }

      // test to see if it's primitives
      if (typeof data[0] === "object") return { rows: data }

      return { rows: data.map((row: any) => (typeof row === "object" ? row : { value: row })) }
    } else if (parserId === TableParserIds.jsonMap) return { rows: Object.values(data) }
    return { rows: [data] }
  }

  // todo: should this be inferAndParse? or 2 methods? parse and inferAndParse?
  parseTableInputsFromString(str = "", parserId?: TableParserIds): jTableTypes.tableInputs {
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

  guessProbabilitiesForAllTableParsers(str: string): { [tableParserId: string]: jTableTypes.probability } {
    const parsers = this._getParsersArray()
    const length = parsers.length
    const probabilities: any = {}
    const specimen = new RowStringSpecimen(str)

    for (let index = 0; index < parsers.length; index++) {
      const parser = parsers[index]
      const probability = parser.getProbForRowSpecimen(specimen)
      const name = parser.getParserId()
      if (probability === 1) {
        const exact: any = {}
        exact[name] = 1
        return exact
      }
      probabilities[name] = probability
    }
    return probabilities
  }

  guessTableParserId(str: string): TableParserIds {
    const probabilities = this.guessProbabilitiesForAllTableParsers(str)

    let maxScore = 0
    let bestGuess: any = null
    for (let option in probabilities) {
      if (probabilities[option] > maxScore) {
        maxScore = probabilities[option]
        bestGuess = option
      }
    }

    return bestGuess
  }
}

export { TableParser }
