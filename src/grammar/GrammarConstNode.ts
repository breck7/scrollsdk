import TreeNode from "../base/TreeNode"

class GrammarConstNode extends TreeNode {
  getValue() {
    // todo: parse type
    if (this.length) return this.childrenToString()
    return this.getWordsFrom(2).join(" ")
  }
  getName() {
    return this.getKeyword()
  }
}

export default GrammarConstNode
