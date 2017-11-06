const TreeNode = require("../base/TreeNode.js")
const GrammarBackedColumnTypes = require("./GrammarBackedColumnTypes.js")

class GrammarBackedCell {
  constructor(word, type, node, line, index) {
    this._word = word
    this._type = type
    this._line = line
    this._node = node
    this._index = index + 1
  }

  getType() {
    return (this._type && this._type.replace("*", "")) || undefined
  }

  getWord() {
    return this._word
  }

  isOptional() {
    return this._type && this._type.endsWith("*")
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

    const wordTypeClass = GrammarBackedCell._getGrammarBackedColumnTypes()[type]
    if (!wordTypeClass)
      return `Grammar definition error: No column type "${type}" found in "${fullLine}" on line ${line}.`

    const isValid = wordTypeClass.isValid(this._word)
    return isValid
      ? ""
      : `Invalid word in "${fullLine}" at line ${line} column ${index}. "${word}" does not fit in "${type}" column.`
  }

  static _getGrammarBackedColumnTypes() {
    this._initCache()
    return GrammarBackedCell._cache_treeColumnTypes
  }

  static _initCache() {
    if (GrammarBackedCell._cache_treeColumnTypes) return

    const program = new TreeNode(GrammarBackedColumnTypes)
    GrammarBackedCell._cache_treeColumnTypes = {}
    program.getChildren().forEach(child => {
      GrammarBackedCell._cache_treeColumnTypes[child.getLine()] = {
        isValid: str => str.match(new RegExp(child.findBeam("isValid")))
      }
    })
  }
}

module.exports = GrammarBackedCell
