import TreeNode from "../base/TreeNode"

import AbstractRuntimeProgram from "./AbstractRuntimeProgram"
import AbstractRuntimeProgramConstructorInterface from "./AbstractRuntimeProgramConstructorInterface"

import { GrammarConstants } from "./GrammarConstants"
import AbstractGrammarDefinitionNode from "./AbstractGrammarDefinitionNode"
import GrammarKeywordDefinitionNode from "./GrammarKeywordDefinitionNode"
import GrammarCellTypeDefinitionNode from "./GrammarCellTypeDefinitionNode"
import UnknownGrammarProgram from "./UnknownGrammarProgram"

import types from "../types"

class GrammarRootNode extends AbstractGrammarDefinitionNode {
  protected _getDefaultNodeConstructor(): types.RunTimeNodeConstructor {
    return undefined
  }

  getProgram() {
    return <GrammarProgram>this.getParent()
  }

  getKeywordMap() {
    // todo: this isn't quite correct. we are allowing too many keywords.
    const map = super.getKeywordMap()
    map[GrammarConstants.extensions] = TreeNode
    map[GrammarConstants.version] = TreeNode
    map[GrammarConstants.name] = TreeNode
    map[GrammarConstants.keywordOrder] = TreeNode
    return map
  }
}

class GrammarAbstractKeywordDefinitionNode extends GrammarKeywordDefinitionNode {
  _isAbstract() {
    return true
  }
}

// GrammarProgram is a constructor that takes a grammar file, and builds a new
// constructor for new language that takes files in that language to execute, compile, etc.
class GrammarProgram extends AbstractGrammarDefinitionNode {
  getKeywordMap() {
    const map: types.stringMap = {}
    map[GrammarConstants.grammar] = GrammarRootNode
    map[GrammarConstants.cellType] = GrammarCellTypeDefinitionNode
    map[GrammarConstants.keyword] = GrammarKeywordDefinitionNode
    map[GrammarConstants.abstract] = GrammarAbstractKeywordDefinitionNode
    return map
  }

  // todo: this code is largely duplicated in abstractruntimeprogram
  getProgramErrors(): types.ParseError[] {
    const errors: types.ParseError[] = []
    let line = 1
    for (let node of this.getTopDownArray()) {
      node._cachedLineNumber = line
      const errs: types.ParseError[] = node.getErrors()
      errs.forEach(err => errors.push(err))
      delete node._cachedLineNumber
      line++
    }
    return errors
  }

  getErrorsInGrammarExamples() {
    const programConstructor = this.getRootConstructor()
    const errors: types.ParseError[] = []
    this.getKeywordDefinitions().forEach(def =>
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

  getKeywordOrder() {
    return this._getGrammarRootNode().get(GrammarConstants.keywordOrder)
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

  protected _getCellTypeDefinitions() {
    const types: { [typeName: string]: GrammarCellTypeDefinitionNode } = {}
    // todo: add built in word types?
    this.getChildrenByNodeConstructor(GrammarCellTypeDefinitionNode).forEach(
      type => (types[(<GrammarCellTypeDefinitionNode>type).getCellTypeId()] = type)
    )
    return types
  }

  getProgram() {
    return this
  }

  getKeywordDefinitions() {
    return <GrammarKeywordDefinitionNode[]>this.getChildrenByNodeConstructor(GrammarKeywordDefinitionNode)
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

  protected _getKeywordsNode(): TreeNode {
    return <TreeNode>this._getGrammarRootNode().getNode(GrammarConstants.keywords)
  }

  private _cachedDefinitions: {
    [keyword: string]: AbstractGrammarDefinitionNode
  }

  getKeywordDefinitionByKeywordPath(keywordPath: string): AbstractGrammarDefinitionNode {
    if (!this._cachedDefinitions) this._cachedDefinitions = {}
    if (this._cachedDefinitions[keywordPath]) return this._cachedDefinitions[keywordPath]

    const parts = keywordPath.split(" ")
    let subject: AbstractGrammarDefinitionNode = this
    let def
    for (let index = 0; index < parts.length; index++) {
      const part = parts[index]
      def = subject.getRunTimeKeywordMapWithDefinitions()[part]
      if (!def) def = <AbstractGrammarDefinitionNode>subject._getCatchAllDefinition()
      subject = def
    }

    this._cachedDefinitions[keywordPath] = def
    return def
  }

  getDocs() {
    return this.toString()
  }

  // At present we only have global keyword definitions (you cannot have scoped keyword definitions right now).
  private _cache_keywordDefinitions: { [keyword: string]: GrammarKeywordDefinitionNode }

  protected _initProgramKeywordDefinitionCache(): void {
    if (this._cache_keywordDefinitions) return undefined

    this._cache_keywordDefinitions = {}

    this.getChildrenByNodeConstructor(GrammarKeywordDefinitionNode).forEach(keywordDefinitionNode => {
      this._cache_keywordDefinitions[
        (<GrammarKeywordDefinitionNode>keywordDefinitionNode).getId()
      ] = keywordDefinitionNode
    })
  }

  // todo: protected?
  _getProgramKeywordDefinitionCache() {
    this._initProgramKeywordDefinitionCache()
    return this._cache_keywordDefinitions
  }

  // todo: protected?
  _getRunTimeCatchAllKeyword(): string {
    return this._getGrammarRootNode().get(GrammarConstants.catchAllKeyword)
  }

  protected _getRootConstructor(): AbstractRuntimeProgramConstructorInterface {
    const extendedConstructor: any =
      this._getGrammarRootNode().getConstructorDefinedInGrammar() || AbstractRuntimeProgram
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

    const keywords = this.getKeywordDefinitions().filter(kw => !kw._isAbstract())
    const keywordContexts = keywords.map(def => def.getMatchBlock()).join("\n\n")

    const includes = keywords.map(keyword => `  - include: '${keyword.getSyntaxContextId()}'`).join("\n")

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

${keywordContexts}`
  }

  // A language where anything goes.
  static getTheAnyLanguageRootConstructor() {
    return this.newFromCondensed(
      `${GrammarConstants.grammar} any
 ${GrammarConstants.catchAllKeyword} any
${GrammarConstants.keyword} any
 ${GrammarConstants.catchAllCellType} any
${GrammarConstants.cellType} any`
    ).getRootConstructor()
  }

  static newFromCondensed(grammarCode: string, grammarPath?: types.filepath) {
    // todo: handle imports
    const tree = new TreeNode(grammarCode)

    // Expand groups
    // todo: rename? maybe change this to "make" or "quickKeywords"?
    const xi = tree.getXI()
    tree.findNodes(`${GrammarConstants.abstract}${xi}${GrammarConstants.group}`).forEach(group => {
      const abstractName = group.getParent().getWord(1)
      group
        .getContent()
        .split(xi)
        .forEach(word => tree.appendLine(`${GrammarConstants.keyword}${xi}${word}${xi}${abstractName}`))
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
