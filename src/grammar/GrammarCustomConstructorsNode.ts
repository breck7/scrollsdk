import TreeNode from "../base/TreeNode"
import TreeUtils from "../base/TreeUtils"

import GrammarBackedNonTerminalNode from "./GrammarBackedNonTerminalNode"
import GrammarBackedBlobNode from "./GrammarBackedBlobNode"
import GrammarBackedTerminalNode from "./GrammarBackedTerminalNode"
import GrammarBackedErrorNode from "./GrammarBackedErrorNode"
import { GrammarConstants, GrammarConstantsErrors } from "./GrammarConstants"

/*FOR_TYPES_ONLY*/ import GrammarProgram from "./GrammarProgram"

import types from "../types"

abstract class AbstractCustomConstructorNode extends TreeNode {
  getTheDefinedConstructor(): types.RunTimeNodeConstructor {
    // todo: allow overriding if custom constructor not found.
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
    if (!this.isAppropriateEnvironment() || this.getTheDefinedConstructor()) return []
    const parent = this.getParent()
    const context = parent.isRoot() ? "" : parent.getFirstWord()
    const point = this.getPoint()
    return [
      {
        kind: GrammarConstantsErrors.invalidConstructorPathError,
        subkind: this.getFirstWord(),
        level: point.x,
        context: context,
        message: `${
          GrammarConstantsErrors.invalidConstructorPathError
        } no constructor "${this.getLine()}" found at line ${point.y}`
      }
    ]
  }

  getBuiltIn() {
    const constructors: types.stringMap = {
      ErrorNode: GrammarBackedErrorNode,
      TerminalNode: GrammarBackedTerminalNode,
      NonTerminalNode: GrammarBackedNonTerminalNode,
      BlobNode: GrammarBackedBlobNode
    }
    return constructors[this.getWord(1)]
  }
}

class CustomNodeJsConstructorNode extends AbstractCustomConstructorNode {
  protected _getCustomConstructor(): types.RunTimeNodeConstructor {
    const filepath = this._getNodeConstructorFilePath()
    const rootPath = (<GrammarProgram>this.getRootNode()).getTheGrammarFilePath()
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

class CustomJavascriptConstructorNode extends AbstractCustomConstructorNode {
  private _cached: any
  static cache: { [code: string]: types.RunTimeNodeConstructor } = {}

  private _getNodeJsConstructor(): types.RunTimeNodeConstructor {
    const jtreePath = __dirname + "/../jtree.node.js"
    const code = `const jtree = require('${jtreePath}').default
/* INDENT FOR BUILD REASONS */  module.exports = ${this.childrenToString()}`
    if (CustomJavascriptConstructorNode.cache[code]) return CustomJavascriptConstructorNode.cache[code]
    const constructorName =
      this.getParent()
        .getParent()
        .getWord(1) ||
      this.getParent()
        .getParent()
        .get(GrammarConstants.name) + "Root"
    const tempFilePath = `${__dirname}/constructor-${constructorName}-${TreeUtils.getRandomString(30)}-temp.js`
    const fs = require("fs")
    try {
      fs.writeFileSync(tempFilePath, code, "utf8")
      CustomJavascriptConstructorNode.cache[code] = require(tempFilePath)
    } catch (err) {
      console.error(err)
    } finally {
      fs.unlinkSync(tempFilePath)
    }

    return CustomJavascriptConstructorNode.cache[code]
  }

  private _getBrowserConstructor(): types.RunTimeNodeConstructor {
    const definedCode = this.childrenToString()
    const tempClassName = "tempConstructor" + TreeUtils.getRandomString(30)
    if (CustomJavascriptConstructorNode.cache[definedCode]) return CustomJavascriptConstructorNode.cache[definedCode]

    const script = document.createElement("script")
    script.innerHTML = `window.${tempClassName} = ${this.childrenToString()}`
    document.head.appendChild(script)
    CustomJavascriptConstructorNode.cache[definedCode] = (<any>window)[tempClassName]
  }

  protected _getCustomConstructor(): types.RunTimeNodeConstructor {
    return this.isNodeJs() ? this._getNodeJsConstructor() : this._getBrowserConstructor()
  }

  getCatchAllNodeConstructor() {
    return TreeNode
  }
}

class GrammarCustomConstructorsNode extends TreeNode {
  getFirstWordMap() {
    const map: types.firstWordToNodeConstructorMap = {}
    map[GrammarConstants.constructorNodeJs] = CustomNodeJsConstructorNode
    map[GrammarConstants.constructorBrowser] = CustomBrowserConstructorNode
    map[GrammarConstants.constructorJavascript] = CustomJavascriptConstructorNode
    return map
  }

  getConstructorForEnvironment(): AbstractCustomConstructorNode {
    const jsConstructor = this.getNode(GrammarConstants.constructorJavascript)
    if (jsConstructor) return <AbstractCustomConstructorNode>jsConstructor
    return <AbstractCustomConstructorNode>(
      this.getNode(this.isNodeJs() ? GrammarConstants.constructorNodeJs : GrammarConstants.constructorBrowser)
    )
  }
}

export default GrammarCustomConstructorsNode
