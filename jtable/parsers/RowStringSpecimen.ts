// todo: detect mixed format, like a csv file with a header. and then suggest ignore that part, or splitting it out?
// maybe we could split a string into sections, and say "we've detected 3 sections, which one do you want to use"?

// todo: split csv into normal csv and advanced delimited.

// todo: allow for metadata like filename and filetype header

import { jTableTypes } from "../../worldWideTypes/jTableTypes"

class RowStringSpecimen {
  constructor(str: string) {
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

export { RowStringSpecimen }
