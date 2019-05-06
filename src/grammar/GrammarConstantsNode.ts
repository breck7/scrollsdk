import TreeNode from "../base/TreeNode"

import GrammarConstNode from "./GrammarConstNode"

import types from "../types"

class GrammarConstantsNode extends TreeNode {
  getCatchAllNodeConstructor(line: string) {
    return GrammarConstNode
  }

  getConstantsObj() {
    const result: types.stringMap = {}
    this.forEach(node => (result[node.getName()] = node.getValue()))
    return result
  }
}

export default GrammarConstantsNode
