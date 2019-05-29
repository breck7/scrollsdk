import TreeNode from "../base/TreeNode"
import { GrammarConstants } from "./GrammarConstants"
import jTreeTypes from "../jTreeTypes"

/*FOR_TYPES_ONLY*/ import GrammarProgram from "./GrammarProgram"
/*FOR_TYPES_ONLY*/ import AbstractRuntimeProgram from "./AbstractRuntimeProgram"
/*FOR_TYPES_ONLY*/ import AbstractRuntimeNonRootNode from "./AbstractRuntimeNonRootNode"
/*FOR_TYPES_ONLY*/ import GrammarCellTypeDefinitionNode from "./GrammarCellTypeDefinitionNode"

/*
A cell contains a word but also the type information for that word.
*/
abstract class AbstractGrammarBackedCell<T> {
  constructor(node: AbstractRuntimeNonRootNode, index: jTreeTypes.int, typeDef: GrammarCellTypeDefinitionNode, cellTypeName: string, isCatchAll: boolean) {
    this._typeDef = typeDef
    this._node = node
    this._isCatchAll = isCatchAll
    this._index = index
    this._cellTypeName = cellTypeName

    this._word = node.getWord(index)
    this._grammarProgram = node.getDefinition().getProgram()
  }

  private _node: any
  protected _grammarProgram: GrammarProgram
  protected _index: jTreeTypes.int
  protected _word: string
  private _typeDef: GrammarCellTypeDefinitionNode
  private _isCatchAll: boolean
  private _cellTypeName: string

  getCellTypeName() {
    return this._cellTypeName
  }

  private _getProgram() {
    return <AbstractRuntimeProgram>this._node.getProgram()
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
    let words = definition ? definition.getAutocompleteWordOptions(this._getProgram()) : []

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
    return this._typeDef
  }

  protected _getLineNumber() {
    return this._node.getPoint().y
  }

  protected _getFullLine() {
    return this._node.getLine()
  }

  protected _getErrorContext() {
    return this._getFullLine().split(" ")[0] // todo: XI
  }

  protected _getExpectedLineCellTypes() {
    return this._node.getDefinition().getExpectedLineCellTypes()
  }

  protected abstract _isValid(): boolean

  isValid(): boolean {
    const runTimeOptions = this._node.getRunTimeEnumOptions(this)
    if (runTimeOptions) return runTimeOptions.includes(this._word)
    return this._getCellTypeDefinition().isValid(this._word, this._getProgram()) && this._isValid()
  }

  getErrorIfAny(): jTreeTypes.ParseError {
    if (this._word !== undefined && this.isValid()) return undefined

    if (this._word === undefined)
      return {
        kind: jTreeTypes.GrammarConstantsErrors.unfilledColumnError,
        subkind: this.getCellTypeName(),
        level: this._index,
        context: this._getErrorContext(),
        message: `${
          jTreeTypes.GrammarConstantsErrors.unfilledColumnError
        } "${this.getCellTypeName()}" cellType in "${this._getFullLine()}" at line ${this._getLineNumber()} word ${
          this._index
        }. Expected line cell types: "${this._getExpectedLineCellTypes()}". definition: ${this._node.getDefinition().toString()}`
      }

    return {
      kind: jTreeTypes.GrammarConstantsErrors.invalidWordError,
      subkind: this.getCellTypeName(),
      level: this._index,
      context: this._getErrorContext(),
      message: `${jTreeTypes.GrammarConstantsErrors.invalidWordError} in "${this._getFullLine()}" at line ${this._getLineNumber()} column ${this._index}. "${
        this._word
      }" does not fit in "${this.getCellTypeName()}" cellType. Expected line cell types: "${this._getExpectedLineCellTypes()}".`
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

  getErrorIfAny(): jTreeTypes.ParseError {
    return {
      kind: jTreeTypes.GrammarConstantsErrors.extraWordError,
      subkind: "",
      level: this._index,
      context: this._getErrorContext(),
      message: `${jTreeTypes.GrammarConstantsErrors.extraWordError} "${this._word}" in "${this._getFullLine()}" at line ${this._getLineNumber()} word ${
        this._index
      }. Expected line cell types: "${this._getExpectedLineCellTypes()}".`
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

  getErrorIfAny(): jTreeTypes.ParseError {
    return {
      kind: jTreeTypes.GrammarConstantsErrors.grammarDefinitionError,
      subkind: this.getCellTypeName(),
      level: this._index,
      context: this._getErrorContext(),
      message: `${jTreeTypes.GrammarConstantsErrors.grammarDefinitionError} For word "${
        this._word
      }" no cellType "${this.getCellTypeName()}" in grammar "${this._grammarProgram.getExtensionName()}" found in "${this._getFullLine()}" on line ${this._getLineNumber()} word ${
        this._index
      }. Expected line cell types: "${this._getExpectedLineCellTypes()}".`
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
