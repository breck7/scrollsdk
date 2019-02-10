const TreeNode = require("../base/TreeNode.js")

/*
A cell contains a word but also the type information for that word.
*/
class GrammarBackedCell {
  constructor(word, type, node, index, grammarProgram) {
    this._word = word
    this._type = type
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

  _getLineNumber() {
    return this._node.getPoint().y
  }

  getErrorMessage() {
    const index = this._index
    const type = this.getType()
    const fullLine = this._node.getLine()
    const word = this._word
    if (word === undefined && this.isOptional()) return ""
    if (word === undefined)
      return `unfilledColumnError "${type}" column in "${fullLine}" at line ${this._getLineNumber()} column ${index}. definition: ${this._node
        .getDefinition()
        .toString()}`
    if (type === undefined)
      return `extraWordError "${word}" in "${fullLine}" at line ${this._getLineNumber()} column ${index}`

    const grammarProgram = this._grammarProgram
    const runTimeGrammarBackedProgram = this._node.getProgram()
    const wordTypeClass = this._getWordTypeClass()
    if (!wordTypeClass)
      return `grammarDefinitionError No column type "${type}" in grammar "${grammarProgram.getExtensionName()}" found in "${fullLine}" on line ${this._getLineNumber()}.`

    const isValid = wordTypeClass.isValid(this._word, runTimeGrammarBackedProgram)
    return isValid
      ? ""
      : `invalidWordError in "${fullLine}" at line ${this._getLineNumber()} column ${index}. "${word}" does not fit in "${type}" column.`
  }
}

module.exports = GrammarBackedCell
