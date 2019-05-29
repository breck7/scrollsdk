import AbstractRuntimeNonRootNode from "./AbstractRuntimeNonRootNode"

import jTreeTypes from "../jTreeTypes"

class GrammarBackedNonTerminalNode extends AbstractRuntimeNonRootNode {
  getFirstWordMap() {
    return this.getDefinition().getRunTimeFirstWordMap()
  }

  // todo: implement
  protected _getNodeJoinCharacter() {
    return "\n"
  }

  compile(targetExtension: jTreeTypes.targetLanguageId) {
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
