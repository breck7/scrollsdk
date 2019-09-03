const { jtree } = require("../../products/jtree.node.js")

import { AbstractTableParser } from "./AbstractTableParser"

import { RowStringSpecimen } from "./RowStringSpecimen"

import { jTableTypes } from "../../worldWideTypes/jTableTypes"
import { TableParserIds } from "../JTableConstants"

import { CsvParser, TsvParser, SsvParser, PsvParser, TreeRowsParser, TreeParser, XmlParser, HtmlParser } from "./JTreeParsers"
import { JsonParser, JsonArrayParser, JsonDataTableWithHeaderParser, JsonVectorParser, JsonMapParser, JsonCountMapParser } from "./JsonParsers"
import { TextParser, SectionsParser, SpacedParser, ListParser, TextListParser } from "./SimpleTextParsers"

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
  parseTableInputsFromObject(data, parserId: TableParserIds): jTableTypes.tableInputs {
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

  guessProbabilitiesForAllTableParsers(str): { [tableParserId: string]: jTableTypes.probability } {
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

  guessTableParserId(str: string): TableParserIds {
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

export { TableParser }
