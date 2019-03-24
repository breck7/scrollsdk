import TreeNode from "../base/TreeNode"
import TreeUtils from "../base/TreeUtils"

import GrammarBackedNonTerminalNode from "./GrammarBackedNonTerminalNode"
import GrammarBackedAnyNode from "./GrammarBackedAnyNode"
import GrammarBackedTerminalNode from "./GrammarBackedTerminalNode"
import GrammarBackedErrorNode from "./GrammarBackedErrorNode"
import GrammarConstants from "./GrammarConstants"

import types from "../types"

class GrammarCustomConstructorNode extends TreeNode {
  protected _getNodeConstructorFilePath() {
    return this.getWord(2)
  }

  // todo: allow for deeper nesting? use Utils.resolveProperty
  getSubModuleName() {
    return this.getWord(3)
  }

  protected _getBuiltInConstructors() {
    return {
      ErrorNode: GrammarBackedErrorNode,
      TerminalNode: GrammarBackedTerminalNode,
      NonTerminalNode: GrammarBackedNonTerminalNode,
      AnyNode: GrammarBackedAnyNode
    }
  }

  getErrors(): types.ParseError[] {
    if (this.getDefinedConstructor()) return []
    const parent = this.getParent()
    const context = parent.isRoot() ? "" : parent.getKeyword()
    const point = this.getPoint()
    return [
      {
        kind: GrammarConstants.errors.invalidConstructorPathError,
        subkind: this.getKeyword(),
        level: point.x,
        context: context,
        message: `${
          GrammarConstants.errors.invalidConstructorPathError
        } no constructor "${this.getLine()}" found at line ${point.y}`
      }
    ]
  }

  getDefinedConstructor(): types.RunTimeNodeConstructor {
    const filepath = this._getNodeConstructorFilePath()
    const builtIns = this._getBuiltInConstructors()
    const builtIn = builtIns[filepath]

    if (builtIn) return builtIn

    const rootPath = this.getRootNode().getTheGrammarFilePath()

    const basePath = TreeUtils.getPathWithoutFileName(rootPath) + "/"
    const fullPath = filepath.startsWith("/") ? filepath : basePath + filepath

    // todo: remove "window" below?
    if (!this.isNodeJs()) {
      const subModule = this.getSubModuleName()
      let constructor: types.RunTimeNodeConstructor
      const constructorName = TreeUtils.getClassNameFromFilePath(filepath)
      if (subModule) {
        constructor = TreeUtils.resolveProperty(window[constructorName], subModule)
        if (!constructor) throw new Error(`constructor ${subModule} not found on window.${constructorName}.`)
      } else {
        constructor = window[constructorName]
        if (!constructor) throw new Error(`constructor window.${constructorName} deduced from ${filepath} not found.`)
      }
      return constructor
    }

    const theModule = require(fullPath)
    const subModule = this.getSubModuleName()
    return subModule ? theModule[subModule] : theModule
  }
}

export default GrammarCustomConstructorNode
