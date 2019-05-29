import TreeNode from "../base/TreeNode"

import GrammarConstNode from "./GrammarConstNode"

import jTreeTypes from "../jTreeTypes"

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
