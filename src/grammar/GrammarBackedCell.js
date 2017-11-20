const TreeNode = require("../base/TreeNode.js")

class GrammarBackedCell {
  constructor(word, type, node, line, index, grammarProgram) {
    this._word = word
    this._type = type
    this._line = line
    this._node = node
    this._grammarProgram = grammarProgram
    this._index = index + 1
  }

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

  getErrorMessage() {
    const index = this._index
    const type = this.getType()
    const fullLine = this._node.getLine()
    const line = this._line
    const word = this._word
    if (word === undefined && this.isOptional()) return ""
    if (word === undefined)
      return `Unfilled "${type}" column in "${fullLine}" at line ${line} column ${index}. definition: ${this._node
        .getDefinition()
        .toString()}`
    if (type === undefined) return `Extra word "${word}" in "${fullLine}" at line ${line} column ${index}`

    const grammarProgram = this._grammarProgram
    const runTimeGrammarBackedProgram = this._node.getProgram()
    const wordTypeClass = this._getWordTypeClass()
    if (!wordTypeClass)
      return `Grammar definition error: No column type "${type}" in grammar "${grammarProgram.getExtensionName()}" found in "${fullLine}" on line ${line}.`

    const isValid = wordTypeClass.isValid(this._word, runTimeGrammarBackedProgram)
    return isValid
      ? ""
      : `Invalid word in "${fullLine}" at line ${line} column ${index}. "${word}" does not fit in "${type}" column.`
  }
}

module.exports = GrammarBackedCell
