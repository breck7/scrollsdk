const TreeNode = require("../TreeNode.js")

const GrammarConstants = require("./GrammarConstants.js")

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
    return this.findBeam(GrammarConstants.compiler.listDelimiter)
  }

  getTransformation() {
    return this.findBeam(GrammarConstants.compiler.sub)
  }

  getIndentCharacter() {
    return this.findBeam(GrammarConstants.compiler.indentCharacter)
  }

  getOpenChildrenString() {
    return this.findBeam(GrammarConstants.compiler.openChildren) || ""
  }

  getCloseChildrenString() {
    return this.findBeam(GrammarConstants.compiler.closeChildren) || ""
  }
}

module.exports = GrammarCompilerNode
