import TreeNode from "../base/TreeNode"
import TreeUtils from "../base/TreeUtils"

import GrammarBackedNonTerminalNode from "./GrammarBackedNonTerminalNode"
import GrammarBackedAnyNode from "./GrammarBackedAnyNode"
import GrammarBackedTerminalNode from "./GrammarBackedTerminalNode"
import GrammarBackedErrorNode from "./GrammarBackedErrorNode"
import { GrammarConstants, GrammarConstantsErrors } from "./GrammarConstants"

import types from "../types"

abstract class AbstractCustomConstructorNode extends TreeNode {
  private _getBuiltInConstructors() {
    return {
      ErrorNode: GrammarBackedErrorNode,
      TerminalNode: GrammarBackedTerminalNode,
      NonTerminalNode: GrammarBackedNonTerminalNode,
      AnyNode: GrammarBackedAnyNode
    }
  }

  getDefinedConstructor(): types.RunTimeNodeConstructor {
    return this.getBuiltIn() || this._getCustomConstructor()
  }

  protected isAppropriateEnvironment() {
    return true
  }

  protected _getCustomConstructor(): types.RunTimeNodeConstructor {
    return undefined
  }

  getErrors(): types.ParseError[] {
    // todo: should this be a try/catch?
    if (!this.isAppropriateEnvironment() || this.getDefinedConstructor()) return []
    const parent = this.getParent()
    const context = parent.isRoot() ? "" : parent.getKeyword()
    const point = this.getPoint()
    return [
      {
        kind: GrammarConstantsErrors.invalidConstructorPathError,
        subkind: this.getKeyword(),
        level: point.x,
        context: context,
        message: `${
          GrammarConstantsErrors.invalidConstructorPathError
        } no constructor "${this.getLine()}" found at line ${point.y}`
      }
    ]
  }

  getBuiltIn() {
    return this._getBuiltInConstructors()[this.getWord(1)]
  }
}

class CustomNodeJsConstructorNode extends AbstractCustomConstructorNode {
  protected _getCustomConstructor(): types.RunTimeNodeConstructor {
    const filepath = this._getNodeConstructorFilePath()
    const rootPath = this.getRootNode().getTheGrammarFilePath()
    const basePath = TreeUtils.getPathWithoutFileName(rootPath) + "/"
    const fullPath = filepath.startsWith("/") ? filepath : basePath + filepath

    const theModule = require(fullPath)
    const subModuleName = this.getWord(2)
    return subModuleName ? TreeUtils.resolveProperty(theModule, subModuleName) : theModule
  }

  // todo: does this support spaces in filepaths?
  private _getNodeConstructorFilePath() {
    return this.getWord(1)
  }

  protected isAppropriateEnvironment() {
    return this.isNodeJs()
  }
}

class CustomBrowserConstructorNode extends AbstractCustomConstructorNode {
  protected _getCustomConstructor(): types.RunTimeNodeConstructor {
    const constructorName = this.getWord(1)
    const constructor = TreeUtils.resolveProperty(window, constructorName)
    if (!constructor) throw new Error(`constructor window.${constructorName} not found.`)

    return constructor
  }

  protected isAppropriateEnvironment() {
    return !this.isNodeJs()
  }
}

class GrammarCustomConstructorsNode extends TreeNode {
  getKeywordMap() {
    const map = {}
    map[GrammarConstants.constructorNodeJs] = CustomNodeJsConstructorNode
    map[GrammarConstants.constructorBrowser] = CustomBrowserConstructorNode
    return map
  }

  getConstructorForEnvironment(): AbstractCustomConstructorNode {
    return this.getNode(this.isNodeJs() ? GrammarConstants.constructorNodeJs : GrammarConstants.constructorBrowser)
  }
}

export default GrammarCustomConstructorsNode
