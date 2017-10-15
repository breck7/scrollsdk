const TreeNode = require("./TreeNode.js")
const TreeSlotTypes = require("./TreeSlotTypes.js")

class TreeCell {
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
      return `Unfilled "${type}" slot in "${fullLine}" at line ${line} slot ${index}. definition: ${this._node
        .getDefinition()
        .toString()}`
    if (type === undefined) return `Extra word "${word}" in "${fullLine}" at line ${line} slot ${index}`

    const wordTypeClass = TreeCell._getTreeSlotTypes()[type]
    if (!wordTypeClass)
      return `Grammar definition error: No slot type "${type}" found in "${fullLine}" on line ${line}.`

    const isValid = wordTypeClass.isValid(this._word)
    return isValid
      ? ""
      : `Invalid word in "${fullLine}" at line ${line} slot ${index}. "${word}" does not fit in "${type}" slot.`
  }

  static _getTreeSlotTypes() {
    this._initCache()
    return TreeCell._cache_treeSlotTypes
  }

  static _initCache() {
    if (TreeCell._cache_treeSlotTypes) return

    const program = new TreeNode(TreeSlotTypes)
    TreeCell._cache_treeSlotTypes = {}
    program.getChildren().forEach(child => {
      TreeCell._cache_treeSlotTypes[child.getLine()] = {
        isValid: str => str.match(new RegExp(child.findBeam("isValid")))
      }
    })
  }
}

module.exports = TreeCell
