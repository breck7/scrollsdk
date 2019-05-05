import TreeNode from "../base/TreeNode"
import { GrammarConstants, GrammarConstantsErrors } from "./GrammarConstants"
import types from "../types"

/*FOR_TYPES_ONLY*/ import GrammarProgram from "./GrammarProgram"
/*FOR_TYPES_ONLY*/ import AbstractRuntimeProgram from "./AbstractRuntimeProgram"
/*FOR_TYPES_ONLY*/ import GrammarCellTypeDefinitionNode from "./GrammarCellTypeDefinitionNode"

/*
A cell contains a word but also the type information for that word.
*/
abstract class AbstractGrammarBackedCell<T> {
  constructor(
    word: string,
    type: GrammarCellTypeDefinitionNode,
    node: any,
    index: types.int,
    isCatchAll: boolean,
    expectedLinePattern: string,
    grammarProgram: GrammarProgram,
    runTimeProgram: AbstractRuntimeProgram
  ) {
    this._word = word
    this._type = type
    this._node = node
    this._isCatchAll = isCatchAll
    this._expectedLinePattern = expectedLinePattern
    this._grammarProgram = grammarProgram
    this._index = index + 1
    this._program = runTimeProgram
  }

  protected _node: any
  protected _grammarProgram: GrammarProgram
  protected _program: AbstractRuntimeProgram
  protected _expectedLinePattern: string
  protected _index: types.int
  protected _word: string
  protected _type: GrammarCellTypeDefinitionNode
  protected _isCatchAll: boolean

  getCellTypeName() {
    return this._type ? this._type.getCellTypeId() : undefined
  }

  isCatchAll() {
    return this._isCatchAll
  }

  abstract getParsed(): T

  getHighlightScope(): string | undefined {
    const definition = this._getCellTypeDefinition()
    if (definition) return definition.getHighlightScope()
  }

  getAutoCompleteWords(partialWord: string) {
    const definition = this._getCellTypeDefinition()
    let words = definition ? definition.getAutocompleteWordOptions(this._program) : []

    const runTimeOptions = this._node.getRunTimeEnumOptions(this)
    if (runTimeOptions) words = runTimeOptions.concat(words)

    if (partialWord) words = words.filter(word => word.includes(partialWord))
    return words.map(word => {
      return {
        text: word,
        displayText: word
      }
    })
  }

  getWord() {
    return this._word
  }

  protected _getCellTypeDefinition() {
    return this._type
  }

  protected _getLineNumber() {
    return this._node.getPoint().y
  }

  protected abstract _isValid(): boolean

  isValid(): boolean {
    const runTimeOptions = this._node.getRunTimeEnumOptions(this)
    if (runTimeOptions) return runTimeOptions.includes(this._word)
    return this._getCellTypeDefinition().isValid(this._word, this._node.getProgram()) && this._isValid()
  }

  getErrorIfAny(): types.ParseError {
    const word = this._word
    const index = this._index
    const type = this.getCellTypeName()
    const fullLine = this._node.getLine()
    const line = this._getLineNumber()
    const context = fullLine.split(" ")[0] // todo: XI
    if (word === undefined)
      return {
        kind: GrammarConstantsErrors.unfilledColumnError,
        subkind: type,
        level: index,
        context: context,
        message: `${
          GrammarConstantsErrors.unfilledColumnError
        } "${type}" cellType in "${fullLine}" at line ${line} word ${index}. Expected pattern: "${
          this._expectedLinePattern
        }". definition: ${this._node.getDefinition().toString()}`
      }

    const runTimeGrammarBackedProgram = this._node.getProgram()

    return this.isValid()
      ? undefined
      : {
          kind: GrammarConstantsErrors.invalidWordError,
          subkind: type,
          level: index,
          context: context,
          message: `${
            GrammarConstantsErrors.invalidWordError
          } in "${fullLine}" at line ${line} column ${index}. "${word}" does not fit in "${type}" cellType. Expected pattern: "${
            this._expectedLinePattern
          }".`
        }
  }
}

class GrammarIntCell extends AbstractGrammarBackedCell<number> {
  _isValid() {
    const num = parseInt(this._word)
    if (isNaN(num)) return false
    return num.toString() === this._word
  }

  getRegexString() {
    return "\-?[0-9]+"
  }

  getParsed() {
    return parseInt(this._word)
  }
}

class GrammarBitCell extends AbstractGrammarBackedCell<boolean> {
  _isValid() {
    const str = this._word
    return str === "0" || str === "1"
  }

  getRegexString() {
    return "[01]"
  }

  getParsed() {
    return !!parseInt(this._word)
  }
}

class GrammarFloatCell extends AbstractGrammarBackedCell<number> {
  _isValid() {
    return !isNaN(parseFloat(this._word))
  }

  getRegexString() {
    return "\-?[0-9]*\.?[0-9]*"
  }

  getParsed() {
    return parseFloat(this._word)
  }
}

// ErrorCellType => grammar asks for a '' cell type here but the grammar does not specify a '' cell type. (todo: bring in didyoumean?)

class GrammarBoolCell extends AbstractGrammarBackedCell<boolean> {
  private _trues = new Set(["1", "true", "t", "yes"])
  private _falses = new Set(["0", "false", "f", "no"])

  _isValid() {
    const str = this._word.toLowerCase()
    return this._trues.has(str) || this._falses.has(str)
  }

  private _getOptions() {
    return Array.from(this._trues).concat(Array.from(this._falses))
  }

  getRegexString() {
    return "(?:" + this._getOptions().join("|") + ")"
  }

  getParsed() {
    return this._trues.has(this._word.toLowerCase())
  }
}

class GrammarAnyCell extends AbstractGrammarBackedCell<string> {
  _isValid() {
    return true
  }

  getRegexString() {
    return "[^ ]+"
  }

  getParsed() {
    return this._word
  }
}

class GrammarExtraWordCellTypeCell extends AbstractGrammarBackedCell<string> {
  _isValid() {
    return false
  }

  getParsed() {
    return this._word
  }

  getErrorIfAny(): types.ParseError {
    const word = this._word
    const index = this._index
    const type = this.getCellTypeName()
    const fullLine = this._node.getLine()
    const line = this._getLineNumber()
    const context = fullLine.split(" ")[0] // todo: XI

    return {
      kind: GrammarConstantsErrors.extraWordError,
      subkind: fullLine,
      level: index,
      context: context,
      message: `${
        GrammarConstantsErrors.extraWordError
      } "${word}" in "${fullLine}" at line ${line} word ${index}. Expected pattern: "${this._expectedLinePattern}".`
    }
  }
}

class GrammarUnknownCellTypeCell extends AbstractGrammarBackedCell<string> {
  _isValid() {
    return false
  }

  getParsed() {
    return this._word
  }

  getErrorIfAny(): types.ParseError {
    const word = this._word
    const index = this._index
    const type = this.getCellTypeName()
    const fullLine = this._node.getLine()
    const line = this._getLineNumber()
    const context = fullLine.split(" ")[0] // todo: XI
    const grammarProgram = this._grammarProgram

    return {
      kind: GrammarConstantsErrors.grammarDefinitionError,
      subkind: type,
      level: index,
      context: context,
      message: `${
        GrammarConstantsErrors.grammarDefinitionError
      } No cellType "${type}" in grammar "${grammarProgram.getExtensionName()}" found in "${fullLine}" on line ${line}. Expected pattern: "${
        this._expectedLinePattern
      }".`
    }
  }
}

export {
  AbstractGrammarBackedCell,
  GrammarIntCell,
  GrammarBitCell,
  GrammarFloatCell,
  GrammarBoolCell,
  GrammarAnyCell,
  GrammarUnknownCellTypeCell,
  GrammarExtraWordCellTypeCell
}
