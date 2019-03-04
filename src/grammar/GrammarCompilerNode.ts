import TreeNode from "../base/TreeNode"

import GrammarConstants from "./GrammarConstants"

class GrammarCompilerNode extends TreeNode {
  getKeywordMap() {
    const types = [
      GrammarConstants.compiler.sub,
      GrammarConstants.compiler.indentCharacter,
      GrammarConstants.compiler.listDelimiter,
      GrammarConstants.compiler.openChildren,
      GrammarConstants.compiler.closeChildren
    ]
    const map = {}
    types.forEach(type => {
      map[type] = TreeNode
    })
    return map
  }

  getTargetExtension() {
    return this.getWord(1)
  }

  getListDelimiter() {
    return this.get(GrammarConstants.compiler.listDelimiter)
  }

  getTransformation() {
    return this.get(GrammarConstants.compiler.sub)
  }

  getIndentCharacter() {
    return this.get(GrammarConstants.compiler.indentCharacter)
  }

  getOpenChildrenString() {
    return this.get(GrammarConstants.compiler.openChildren) || ""
  }

  getCloseChildrenString() {
    return this.get(GrammarConstants.compiler.closeChildren) || ""
  }
}

export default GrammarCompilerNode
