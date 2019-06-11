import AbstractRuntimeNonRootNode from "./AbstractRuntimeNonRootNode"

import jTreeTypes from "../jTreeTypes"

class GrammarBackedNonTerminalNode extends AbstractRuntimeNonRootNode {
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

  private static _backupConstructorEnabled = false

  public static useAsBackupConstructor() {
    return GrammarBackedNonTerminalNode._backupConstructorEnabled
  }

  public static setAsBackupConstructor(value: boolean) {
    GrammarBackedNonTerminalNode._backupConstructorEnabled = value
    return GrammarBackedNonTerminalNode
  }
}

export default GrammarBackedNonTerminalNode
