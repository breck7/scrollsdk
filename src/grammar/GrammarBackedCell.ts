import TreeNode from "../base/TreeNode"
import types from "../types"

/*
A cell contains a word but also the type information for that word.
*/
class GrammarBackedCell {
  constructor(word: string, type: string, node: any, index: types.int, expectedPattern: string, grammarProgram: any) {
    this._word = word
    this._type = type
    this._node = node
    this._expectedPattern = expectedPattern
    this._grammarProgram = grammarProgram
    this._index = index + 1
  }

  private _node: any
  private _grammarProgram: any
  private _expectedPattern: string
  private _index: types.int
  private _word: string
  private _type: string

  getType() {
    return (this._type && this._type.replace("*", "")) || undefined
  }

  getWord() {
    return this._word
  }

  getParsed() {
    return this._getWordTypeClass().parse(this._word)
  }

  isOptional() {
    return this._type && this._type.endsWith("*")
  }

  _getWordTypeClass() {
    return this._grammarProgram.getWordTypes()[this.getType()]
  }

  _getLineNumber() {
    return this._node.getPoint().y
  }

  getErrorIfAny(): types.ParseError {
    const word = this._word
    if (word === undefined && this.isOptional()) return undefined
    const index = this._index
    const type = this.getType()
    const fullLine = this._node.getLine()
    const line = this._getLineNumber()
    const context = fullLine.split(" ")[0] // todo: XI
    if (word === undefined)
      return {
        kind: "unfilledColumnError",
        subkind: type,
        level: index,
        context: context,
        message: `unfilledColumnError "${type}" column in "${fullLine}" at line ${line} column ${index}. Expected pattern: "${
          this._expectedPattern
        }". definition: ${this._node.getDefinition().toString()}`
      }
    if (type === undefined)
      return {
        kind: "extraWordError",
        subkind: fullLine,
        level: index,
        context: context,
        message: `extraWordError "${word}" in "${fullLine}" at line ${line} column ${index}. Expected pattern: "${
          this._expectedPattern
        }".`
      }

    const grammarProgram = this._grammarProgram
    const runTimeGrammarBackedProgram = this._node.getProgram()
    const wordTypeClass = this._getWordTypeClass()
    if (!wordTypeClass)
      return {
        kind: "grammarDefinitionError",
        subkind: type,
        level: index,
        context: context,
        message: `grammarDefinitionError No column type "${type}" in grammar "${grammarProgram.getExtensionName()}" found in "${fullLine}" on line ${line}. Expected pattern: "${
          this._expectedPattern
        }".`
      }

    const isValid = wordTypeClass.isValid(this._word, runTimeGrammarBackedProgram)
    return isValid
      ? undefined
      : {
          kind: "invalidWordError",
          subkind: type,
          level: index,
          context: context,
          message: `invalidWordError in "${fullLine}" at line ${line} column ${index}. "${word}" does not fit in "${type}" column. Expected pattern: "${
            this._expectedPattern
          }".`
        }
  }
}

export default GrammarBackedCell
