import TreeNode from "../base/TreeNode"

import AbstractRuntimeProgram from "./AbstractRuntimeProgram"
import AbstractRuntimeProgramConstructorInterface from "./AbstractRuntimeProgramConstructorInterface"

import { GrammarConstants } from "./GrammarConstants"
import AbstractGrammarDefinitionNode from "./AbstractGrammarDefinitionNode"
import GrammarNodeTypeDefinitionNode from "./GrammarNodeTypeDefinitionNode"
import GrammarCellTypeDefinitionNode from "./GrammarCellTypeDefinitionNode"
import UnknownGrammarProgram from "./UnknownGrammarProgram"

import jTreeTypes from "../jTreeTypes"

class GrammarRootNode extends AbstractGrammarDefinitionNode {
  protected _getDefaultNodeConstructor(): jTreeTypes.RunTimeNodeConstructor {
    return undefined
  }

  getProgram() {
    return <GrammarProgram>this.getParent()
  }

  getFirstWordMap() {
    // todo: this isn't quite correct. we are allowing too many firstWords.
    const map = super.getFirstWordMap()
    map[GrammarConstants.extensions] = TreeNode
    map[GrammarConstants.version] = TreeNode
    map[GrammarConstants.name] = TreeNode
    map[GrammarConstants.nodeTypeOrder] = TreeNode
    return map
  }
}

class GrammarAbstractNodeTypeDefinitionNode extends GrammarNodeTypeDefinitionNode {
  _isAbstract() {
    return true
  }
}

// GrammarProgram is a constructor that takes a grammar file, and builds a new
// constructor for new language that takes files in that language to execute, compile, etc.
class GrammarProgram extends AbstractGrammarDefinitionNode {
  getFirstWordMap() {
    const map: jTreeTypes.stringMap = {}
    map[GrammarConstants.grammar] = GrammarRootNode
    map[GrammarConstants.cellType] = GrammarCellTypeDefinitionNode
    map[GrammarConstants.nodeType] = GrammarNodeTypeDefinitionNode
    map[GrammarConstants.abstract] = GrammarAbstractNodeTypeDefinitionNode
    return map
  }

  // todo: this code is largely duplicated in abstractruntimeprogram
  getProgramErrors(): jTreeTypes.TreeError[] {
    const errors: jTreeTypes.TreeError[] = []
    let line = 1
    for (let node of this.getTopDownArray()) {
      node._cachedLineNumber = line
      const errs: jTreeTypes.TreeError[] = node.getErrors()
      errs.forEach(err => errors.push(err))
      delete node._cachedLineNumber
      line++
    }
    return errors
  }

  getErrorsInGrammarExamples() {
    const programConstructor = this.getRootConstructor()
    const errors: jTreeTypes.TreeError[] = []
    this.getNodeTypeDefinitions().forEach(def =>
      def.getExamples().forEach(example => {
        const exampleProgram = new programConstructor(example.childrenToString())
        exampleProgram.getProgramErrors().forEach(err => {
          errors.push(err)
        })
      })
    )
    return errors
  }

  getTargetExtension() {
    return this._getGrammarRootNode().getTargetExtension()
  }

  getNodeTypeOrder() {
    return this._getGrammarRootNode().get(GrammarConstants.nodeTypeOrder)
  }

  private _cache_cellTypes: {
    [name: string]: GrammarCellTypeDefinitionNode
  }

  getCellTypeDefinitions() {
    if (!this._cache_cellTypes) this._cache_cellTypes = this._getCellTypeDefinitions()
    return this._cache_cellTypes
  }

  getCellTypeDefinition(word: string) {
    const type = this.getCellTypeDefinitions()[word]
    // todo: return unknownCellTypeDefinition

    return type
  }

  getNodeTypeFamilyTree() {
    const tree = new TreeNode()
    Object.values(this.getNodeTypeDefinitions()).forEach(node => {
      const path = node.getAncestorNodeTypeNamesArray().join(" ")
      tree.touchNode(path)
    })
    return tree
  }

  protected _getCellTypeDefinitions() {
    const types: { [typeName: string]: GrammarCellTypeDefinitionNode } = {}
    // todo: add built in word types?
    this.getChildrenByNodeConstructor(GrammarCellTypeDefinitionNode).forEach(type => (types[(<GrammarCellTypeDefinitionNode>type).getCellTypeId()] = type))
    return types
  }

  getProgram() {
    return this
  }

  getNodeTypeDefinitions() {
    return <GrammarNodeTypeDefinitionNode[]>this.getChildrenByNodeConstructor(GrammarNodeTypeDefinitionNode)
  }

  // todo: remove?
  getTheGrammarFilePath() {
    return this.getLine()
  }

  protected _getGrammarRootNode() {
    return <GrammarRootNode>this.getNodeByType(GrammarRootNode)
  }

  getExtensionName() {
    return this.getGrammarName()
  }

  getGrammarName(): string | undefined {
    return this._getGrammarRootNode().get(GrammarConstants.name)
  }

  protected _getNodeTypesNode(): TreeNode {
    return <TreeNode>this._getGrammarRootNode().getNode(GrammarConstants.nodeTypes)
  }

  private _cachedDefinitions: {
    [firstWord: string]: AbstractGrammarDefinitionNode
  }

  getNodeTypeDefinitionByFirstWordPath(firstWordPath: string): AbstractGrammarDefinitionNode {
    if (!this._cachedDefinitions) this._cachedDefinitions = {}
    if (this._cachedDefinitions[firstWordPath]) return this._cachedDefinitions[firstWordPath]

    const parts = firstWordPath.split(" ")
    let subject: AbstractGrammarDefinitionNode = this
    let def
    for (let index = 0; index < parts.length; index++) {
      const part = parts[index]
      def = subject.getRunTimeFirstWordMapWithDefinitions()[part]
      if (!def) def = <AbstractGrammarDefinitionNode>subject._getCatchAllDefinition()
      subject = def
    }

    this._cachedDefinitions[firstWordPath] = def
    return def
  }

  getDocs() {
    return this.toString()
  }

  // At present we only have global nodeType definitions (you cannot have scoped nodeType definitions right now).
  private _cache_nodeTypeDefinitions: { [nodeTypeName: string]: GrammarNodeTypeDefinitionNode }

  protected _initProgramNodeTypeDefinitionCache(): void {
    if (this._cache_nodeTypeDefinitions) return undefined

    this._cache_nodeTypeDefinitions = {}

    this.getChildrenByNodeConstructor(GrammarNodeTypeDefinitionNode).forEach(nodeTypeDefinitionNode => {
      this._cache_nodeTypeDefinitions[(<GrammarNodeTypeDefinitionNode>nodeTypeDefinitionNode).getNodeTypeIdFromDefinition()] = nodeTypeDefinitionNode
    })
  }

  // todo: protected?
  _getProgramNodeTypeDefinitionCache() {
    this._initProgramNodeTypeDefinitionCache()
    return this._cache_nodeTypeDefinitions
  }

  // todo: protected?
  _getRunTimeCatchAllNodeTypeId(): string {
    return this._getGrammarRootNode().get(GrammarConstants.catchAllNodeType)
  }

  protected _getRootConstructor(): AbstractRuntimeProgramConstructorInterface {
    const extendedConstructor: any = this._getGrammarRootNode().getConstructorDefinedInGrammar() || AbstractRuntimeProgram
    const grammarProgram = this

    // Note: this is some of the most unorthodox code in this repo. We create a class on the fly for your
    // new language.
    return <AbstractRuntimeProgramConstructorInterface>(<any>class extends extendedConstructor {
      getGrammarProgram(): GrammarProgram {
        return grammarProgram
      }
    })
  }

  private _cache_rootConstructorClass: AbstractRuntimeProgramConstructorInterface

  getRootConstructor(): AbstractRuntimeProgramConstructorInterface {
    if (!this._cache_rootConstructorClass) this._cache_rootConstructorClass = this._getRootConstructor()
    return this._cache_rootConstructorClass
  }

  private _getFileExtensions(): string {
    return this._getGrammarRootNode().get(GrammarConstants.extensions)
      ? this._getGrammarRootNode()
          .get(GrammarConstants.extensions)
          .split(" ")
          .join(",")
      : this.getExtensionName()
  }

  toSublimeSyntaxFile() {
    const types = this.getCellTypeDefinitions()
    const variables = Object.keys(types)
      .map(name => ` ${name}: '${types[name].getRegexString()}'`)
      .join("\n")

    const defs = this.getNodeTypeDefinitions().filter(kw => !kw._isAbstract())
    const nodeTypeContexts = defs.map(def => def.getMatchBlock()).join("\n\n")
    const includes = defs.map(nodeTypeDef => `  - include: '${nodeTypeDef.getSublimeSyntaxContextId()}'`).join("\n")

    return `%YAML 1.2
---
name: ${this.getExtensionName()}
file_extensions: [${this._getFileExtensions()}]
scope: source.${this.getExtensionName()}

variables:
${variables}

contexts:
 main:
${includes}

${nodeTypeContexts}`
  }

  // A language where anything goes.
  static getTheAnyLanguageRootConstructor() {
    return this.newFromCondensed(
      `${GrammarConstants.grammar}
 ${GrammarConstants.name} any
 ${GrammarConstants.catchAllNodeType} anyNode
${GrammarConstants.nodeType} anyNode
 ${GrammarConstants.catchAllCellType} anyWord
 ${GrammarConstants.firstCellType} anyWord
${GrammarConstants.cellType} anyWord`
    ).getRootConstructor()
  }

  static newFromCondensed(grammarCode: string, grammarPath?: jTreeTypes.filepath) {
    // todo: handle imports
    const tree = new TreeNode(grammarCode)

    // Expand groups
    // todo: rename? maybe change this to something like "makeNodeTypes"?
    const xi = tree.getXI()
    tree.findNodes(`${GrammarConstants.abstract}${xi}${GrammarConstants.group}`).forEach(group => {
      const abstractName = group.getParent().getWord(1)
      group
        .getContent()
        .split(xi)
        .forEach(word => tree.appendLine(`${GrammarConstants.nodeType}${xi}${word}${xi}${abstractName}`))
    })

    return new GrammarProgram(tree.getExpanded(1, 2), grammarPath)
  }

  async loadAllConstructorScripts(baseUrlPath: string): Promise<string[]> {
    if (!this.isBrowser()) return undefined
    const uniqueScriptsSet = new Set(
      this.getNodesByGlobPath(`* ${GrammarConstants.constructors} ${GrammarConstants.constructorBrowser}`)
        .filter(node => node.getWord(2))
        .map(node => baseUrlPath + node.getWord(2))
    )

    return Promise.all(Array.from(uniqueScriptsSet).map(script => GrammarProgram._appendScriptOnce(script)))
  }

  private static _scriptLoadingPromises: { [url: string]: Promise<string> } = {}

  private static async _appendScriptOnce(url: string) {
    // if (this.isNodeJs()) return undefined
    if (!url) return undefined
    if (this._scriptLoadingPromises[url]) return this._scriptLoadingPromises[url]

    this._scriptLoadingPromises[url] = this._appendScript(url)
    return this._scriptLoadingPromises[url]
  }

  private static _appendScript(url: string) {
    //https://bradb.net/blog/promise-based-js-script-loader/
    return new Promise<string>(function(resolve, reject) {
      let resolved = false
      const scriptEl = document.createElement("script")

      scriptEl.type = "text/javascript"
      scriptEl.src = url
      scriptEl.async = true
      scriptEl.onload = (<any>scriptEl).onreadystatechange = function() {
        if (!resolved && (!this.readyState || this.readyState == "complete")) {
          resolved = true
          resolve(url)
        }
      }
      scriptEl.onerror = scriptEl.onabort = reject
      document.head.appendChild(scriptEl)
    })
  }
}

export default GrammarProgram
