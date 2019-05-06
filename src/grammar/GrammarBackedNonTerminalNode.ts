import AbstractRuntimeNonRootNode from "./AbstractRuntimeNonRootNode"

import types from "../types"

class GrammarBackedNonTerminalNode extends AbstractRuntimeNonRootNode {
  getKeywordMap() {
    return this.getDefinition().getRunTimeKeywordMap()
  }

  // todo: implement
  protected _getNodeJoinCharacter() {
    return "\n"
  }

  compile(targetExtension: types.targetLanguageId) {
    const compiler = this.getCompilerNode(targetExtension)
    const openChildrenString = compiler.getOpenChildrenString()
    const closeChildrenString = compiler.getCloseChildrenString()

    const compiledLine = this.getCompiledLine(targetExtension)
    const indent = this.getCompiledIndentation(targetExtension)

    const compiledChildren = this.map(child => child.compile(targetExtension)).join(this._getNodeJoinCharacter())

    return `${indent}${compiledLine}${openChildrenString}
${compiledChildren}
${indent}${closeChildrenString}`
  }
}

export default GrammarBackedNonTerminalNode
