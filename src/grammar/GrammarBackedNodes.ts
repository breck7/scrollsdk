import { AbstractRuntimeNonRootNode } from "./AbstractRuntimeNodes"
import { GrammarConstants } from "./GrammarConstants"
import { UnknownNodeTypeError, BlankLineError } from "./TreeErrorTypes"
import jTreeTypes from "../jTreeTypes"

class GrammarBackedTerminalNode extends AbstractRuntimeNonRootNode {}

class GrammarBackedErrorNode extends AbstractRuntimeNonRootNode {
  getLineCellTypes() {
    return "error ".repeat(this.getWords().length).trim()
  }

  getErrors(): UnknownNodeTypeError[] {
    return [this.getFirstWord() ? new UnknownNodeTypeError(this) : new BlankLineError(this)]
  }
}

class GrammarBackedNonTerminalNode extends AbstractRuntimeNonRootNode {
  // todo: implement
  protected _getNodeJoinCharacter() {
    return "\n"
  }

  compile(targetExtension: jTreeTypes.targetLanguageId) {
    const compiler = this._getCompilerNode(targetExtension)
    const openChildrenString = compiler.getOpenChildrenString()
    const closeChildrenString = compiler.getCloseChildrenString()

    const compiledLine = this._getCompiledLine(targetExtension)
    const indent = this._getCompiledIndentation(targetExtension)

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

class GrammarBackedBlobNode extends GrammarBackedNonTerminalNode {
  getFirstWordMap() {
    return {}
  }

  getErrors(): jTreeTypes.TreeError[] {
    return []
  }

  getCatchAllNodeConstructor(line: string) {
    return GrammarBackedBlobNode
  }
}

export { GrammarBackedTerminalNode, GrammarBackedErrorNode, GrammarBackedNonTerminalNode, GrammarBackedBlobNode }
