import { TableParserIds } from "../JTableConstants"

import { AbstractTableParser } from "./AbstractTableParser"

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

export { TextParser, SectionsParser, SpacedParser, ListParser, TextListParser }
