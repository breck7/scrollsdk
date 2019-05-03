import TreeNode from "../base/TreeNode"
import TreeUtils from "../base/TreeUtils"

import { GrammarConstants } from "./GrammarConstants"
import GrammarDefinitionErrorNode from "./GrammarDefinitionErrorNode"
import GrammarCustomConstructorsNode from "./GrammarCustomConstructorsNode"
import GrammarCompilerNode from "./GrammarCompilerNode"
import GrammarExampleNode from "./GrammarExampleNode"
import GrammarConstantsNode from "./GrammarConstantsNode"

import GrammarBackedNonTerminalNode from "./GrammarBackedNonTerminalNode"
import GrammarBackedAnyNode from "./GrammarBackedAnyNode"
import GrammarBackedTerminalNode from "./GrammarBackedTerminalNode"

/*FOR_TYPES_ONLY*/ import GrammarProgram from "./GrammarProgram"
/*FOR_TYPES_ONLY*/ import GrammarKeywordDefinitionNode from "./GrammarKeywordDefinitionNode"

import types from "../types"

abstract class AbstractGrammarDefinitionNode extends TreeNode {
  getKeywordMap() {
    const types = [
      GrammarConstants.frequency,
      GrammarConstants.keywords,
      GrammarConstants.cells,
      GrammarConstants.description,
      GrammarConstants.catchAllKeyword,
      GrammarConstants.catchAllCellType,
      GrammarConstants.defaults,
      GrammarConstants.tags,
      GrammarConstants.any,
      GrammarConstants.group,
      GrammarConstants.highlightScope,
      GrammarConstants.required,
      GrammarConstants.single
    ]

    const map = {}
    types.forEach(type => {
      map[type] = TreeNode
    })
    map[GrammarConstants.constants] = GrammarConstantsNode
    map[GrammarConstants.compilerKeyword] = GrammarCompilerNode
    map[GrammarConstants.constructors] = GrammarCustomConstructorsNode
    map[GrammarConstants.example] = GrammarExampleNode
    return map
  }

  getId() {
    return this.getWord(1)
  }

  protected _isNonTerminal() {
    return this._isAnyNode() || this.has(GrammarConstants.keywords) || this.has(GrammarConstants.catchAllKeyword)
  }

  _isAbstract() {
    return false
  }

  protected _isAnyNode() {
    return this.has(GrammarConstants.any)
  }

  private _cache_definedNodeConstructor

  getDefinedConstructor() {
    if (!this._cache_definedNodeConstructor) this._cache_definedNodeConstructor = this._getDefinedNodeConstructor()
    return this._cache_definedNodeConstructor
  }

  protected _getDefaultNodeConstructor(): types.RunTimeNodeConstructor {
    if (this._isAnyNode()) return GrammarBackedAnyNode

    return this._isNonTerminal() ? GrammarBackedNonTerminalNode : GrammarBackedTerminalNode
  }

  /* Node constructor is the actual JS class being initiated, different than the Node type. */
  protected _getDefinedNodeConstructor(): types.RunTimeNodeConstructor {
    const customConstructorsDefinition = <GrammarCustomConstructorsNode>this.getNode(GrammarConstants.constructors)
    if (customConstructorsDefinition) {
      const envConstructor = customConstructorsDefinition.getConstructorForEnvironment()
      if (envConstructor) return envConstructor.getDefinedConstructor()
    }
    return this._getDefaultNodeConstructor()
  }

  getCatchAllNodeConstructor(line: string) {
    return GrammarDefinitionErrorNode
  }

  getProgram(): GrammarProgram {
    return <GrammarProgram>this.getParent()
  }

  getDefinitionCompilerNode(targetLanguage, node) {
    const compilerNode = this._getCompilerNodes().find(node => (<any>node).getTargetExtension() === targetLanguage)
    if (!compilerNode) throw new Error(`No compiler for language "${targetLanguage}" for line "${node.getLine()}"`)
    return compilerNode
  }

  protected _getCompilerNodes() {
    return <GrammarCompilerNode[]>this.getChildrenByNodeType(GrammarCompilerNode) || []
  }

  // todo: remove?
  // for now by convention first compiler is "target extension"
  getTargetExtension() {
    const firstNode = this._getCompilerNodes()[0]
    return firstNode ? firstNode.getTargetExtension() : ""
  }

  private _cache_keywordsMap

  getRunTimeKeywordMap() {
    this._initKeywordsMapCache()
    return this._cache_keywordsMap
  }

  getRunTimeKeywordNames() {
    return Object.keys(this.getRunTimeKeywordMap())
  }

  getRunTimeKeywordMapWithDefinitions() {
    const defs = this._getProgramKeywordDefinitionCache()
    return TreeUtils.mapValues(this.getRunTimeKeywordMap(), key => defs[key])
  }

  getRequiredCellTypeNames(): string[] {
    const parameters = this.get(GrammarConstants.cells)
    return parameters ? parameters.split(" ") : []
  }

  getCatchAllCellTypeName(): string | undefined {
    return this.get(GrammarConstants.catchAllCellType)
  }

  /*
   {key<string>: JSKeywordDefClass}
  */
  protected _initKeywordsMapCache() {
    if (this._cache_keywordsMap) return undefined
    // todo: make this handle extensions.
    const keywordsInScope = this._getKeywordsInScope()

    this._cache_keywordsMap = {}
    // terminals dont have acceptable keywords
    if (!keywordsInScope.length) return undefined

    const allProgramKeywordDefinitions = this._getProgramKeywordDefinitionCache()
    const keywords = Object.keys(allProgramKeywordDefinitions)
    keywords
      .filter(keyword => allProgramKeywordDefinitions[keyword].isOrExtendsAKeywordInScope(keywordsInScope))
      .filter(keyword => !allProgramKeywordDefinitions[keyword]._isAbstract())
      .forEach(keyword => {
        this._cache_keywordsMap[keyword] = allProgramKeywordDefinitions[keyword].getDefinedConstructor()
      })
  }

  // todo: protected?
  _getKeywordsInScope(): string[] {
    const keywords = this._getKeywordsNode()
    return keywords ? keywords.getKeywords() : []
  }

  getTopNodeTypes() {
    const definitions = this._getProgramKeywordDefinitionCache()
    const keywords = this.getRunTimeKeywordMap()
    const arr = Object.keys(keywords).map(keyword => definitions[keyword])
    arr.sort(TreeUtils.sortByAccessor(definition => definition.getFrequency()))
    arr.reverse()
    return arr.map(definition => definition.getId())
  }

  protected _getKeywordsNode(): TreeNode {
    // todo: allow multiple of these if we allow mixins?
    return this.getNode(GrammarConstants.keywords)
  }

  isRequired(): boolean {
    GrammarConstants
    return this.has(GrammarConstants.required)
  }

  isSingle(): boolean {
    return this.has(GrammarConstants.single)
  }

  // todo: protected?
  _getRunTimeCatchAllKeyword(): string {
    return ""
  }

  getKeywordDefinitionByName(keyword: string): AbstractGrammarDefinitionNode {
    const definitions = this._getProgramKeywordDefinitionCache()
    return definitions[keyword] || this._getCatchAllDefinition() // todo: this is where we might do some type of keyword lookup for user defined fns.
  }

  protected _getCatchAllDefinition(): AbstractGrammarDefinitionNode {
    const catchAllKeyword = this._getRunTimeCatchAllKeyword()
    const definitions = this._getProgramKeywordDefinitionCache()
    const def = definitions[catchAllKeyword]
    if (def) return def

    // todo: implement contraints like a grammar file MUST have a catch all.
    if (this.isRoot()) throw new Error(`This grammar language lacks a root catch all definition`)
    else return (<AbstractGrammarDefinitionNode>this.getParent())._getCatchAllDefinition()
  }

  private _cache_catchAllConstructor

  protected _initCatchAllNodeConstructorCache() {
    if (this._cache_catchAllConstructor) return undefined

    this._cache_catchAllConstructor = this._getCatchAllDefinition().getDefinedConstructor()
  }

  getHighlightScope(): string | undefined {
    return this.get(GrammarConstants.highlightScope)
  }

  isDefined(keyword) {
    return !!this._getProgramKeywordDefinitionCache()[keyword.toLowerCase()]
  }

  // todo: protected?
  _getProgramKeywordDefinitionCache(): { [keyword: string]: GrammarKeywordDefinitionNode } {
    return this.getProgram()._getProgramKeywordDefinitionCache()
  }

  getRunTimeCatchAllNodeConstructor() {
    this._initCatchAllNodeConstructorCache()
    return this._cache_catchAllConstructor
  }
}

export default AbstractGrammarDefinitionNode
