import TreeNode from "../base/TreeNode"

import GrammarConstNode from "./GrammarConstNode"

class GrammarConstantsNode extends TreeNode {
  getCatchAllNodeClass(line) {
    return GrammarConstNode
  }

  getConstantsObj() {
    const result = {}
    this.forEach(node => {
      const name = node.getName()
      result[name] = node.getValue()
    })
    return result
  }
}

export default GrammarConstantsNode
