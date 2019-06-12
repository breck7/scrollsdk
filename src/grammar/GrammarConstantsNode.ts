import TreeNode from "../base/TreeNode"

import jTreeTypes from "../jTreeTypes"

class GrammarConstNode extends TreeNode {
  getValue() {
    // todo: parse type
    if (this.length) return this.childrenToString()
    return this.getWordsFrom(2).join(" ")
  }
  getName() {
    return this.getFirstWord()
  }
}

class GrammarConstantsNode extends TreeNode {
  getCatchAllNodeConstructor(line: string) {
    return GrammarConstNode
  }

  getConstantsObj() {
    const result: jTreeTypes.stringMap = {}
    this.forEach(node => (result[node.getName()] = node.getValue()))
    return result
  }
}

export default GrammarConstantsNode
