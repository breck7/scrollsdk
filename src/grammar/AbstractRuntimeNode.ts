import TreeNode from "../base/TreeNode"

abstract class AbstractRuntimeNode extends TreeNode {
  getGrammarProgram(): any {}

  getProgram(): AbstractRuntimeNode {
    return this
  }
}

export default AbstractRuntimeNode
