import TreeNode from "../base/TreeNode"
import TreeUtils from "../base/TreeUtils"

import { GrammarConstants, GrammarStandardCellTypes } from "./GrammarConstants"
import GrammarCustomConstructorsNode from "./GrammarCustomConstructorsNode"
import GrammarCompilerNode from "./GrammarCompilerNode"
import GrammarExampleNode from "./GrammarExampleNode"
import GrammarConstantsNode from "./GrammarConstantsNode"

import GrammarBackedNonTerminalNode from "./GrammarBackedNonTerminalNode"
import GrammarBackedBlobNode from "./GrammarBackedBlobNode"
import GrammarBackedTerminalNode from "./GrammarBackedTerminalNode"

/*FOR_TYPES_ONLY*/ import GrammarProgram from "./GrammarProgram"
/*FOR_TYPES_ONLY*/ import GrammarNodeTypeDefinitionNode from "./GrammarNodeTypeDefinitionNode"

import jTreeTypes from "../jTreeTypes"

import { UnknownNodeTypeError, BlankLineError } from "./TreeErrorTypes"

class GrammarDefinitionErrorNode extends TreeNode {
  getErrors(): jTreeTypes.TreeError[] {
    return [this.getFirstWord() ? new UnknownNodeTypeError(this) : new BlankLineError(this)]
  }

  getLineCellTypes() {
    return [<string>GrammarConstants.nodeType].concat(this.getWordsFrom(1).map(word => GrammarStandardCellTypes.any)).join(" ")
  }
}

abstract class AbstractGrammarDefinitionNode extends TreeNode {
  getFirstWordMap(): jTreeTypes.firstWordToNodeConstructorMap {
    const types = [
      GrammarConstants.frequency,
      GrammarConstants.nodeTypes,
      GrammarConstants.cells,
      GrammarConstants.description,
      GrammarConstants.catchAllNodeType,
      GrammarConstants.catchAllCellType,
      GrammarConstants.firstCellType,
      GrammarConstants.defaults,
      GrammarConstants.tags,
      GrammarConstants.blob,
      GrammarConstants.group,
      GrammarConstants.required,
      GrammarConstants.single
    ]

    const map: jTreeTypes.firstWordToNodeConstructorMap = {}
    types.forEach(type => {
      map[type] = TreeNode
    })
    map[GrammarConstants.constants] = GrammarConstantsNode
    map[GrammarConstants.compilerNodeType] = GrammarCompilerNode
    map[GrammarConstants.constructors] = GrammarCustomConstructorsNode
    map[GrammarConstants.example] = GrammarExampleNode
    return map
  }

  getNodeTypeIdFromDefinition() {
    return this.getWord(1)
  }

  protected _isNonTerminal() {
    return this._isBlobNode() || this.has(GrammarConstants.nodeTypes) || this.has(GrammarConstants.catchAllNodeType)
  }

  _isAbstract() {
    return false
  }

  protected _isBlobNode() {
    return this.has(GrammarConstants.blob)
  }

  private _cache_definedNodeConstructor: jTreeTypes.RunTimeNodeConstructor

  getConstructorDefinedInGrammar() {
    if (!this._cache_definedNodeConstructor) this._cache_definedNodeConstructor = this._getDefinedNodeConstructor()
    return this._cache_definedNodeConstructor
  }

  protected _getDefaultNodeConstructor(): jTreeTypes.RunTimeNodeConstructor {
    if (this._isBlobNode()) return GrammarBackedBlobNode

    return this._isNonTerminal() ? GrammarBackedNonTerminalNode : GrammarBackedTerminalNode
  }

  /* Node constructor is the actual JS class being initiated, different than the Node type. */
  protected _getDefinedNodeConstructor(): jTreeTypes.RunTimeNodeConstructor {
    const customConstructorsDefinition = <GrammarCustomConstructorsNode>this.getChildrenByNodeConstructor(GrammarCustomConstructorsNode)[0]
    if (customConstructorsDefinition) {
      const envConstructor = customConstructorsDefinition.getConstructorForEnvironment()
      if (envConstructor) return envConstructor.getTheDefinedConstructor()
    }
    return this._getDefaultNodeConstructor()
  }

  getCatchAllNodeConstructor(line: string) {
    return GrammarDefinitionErrorNode
  }

  getProgram(): GrammarProgram {
    return <GrammarProgram>this.getParent()
  }

  getDefinitionCompilerNode(targetLanguage: jTreeTypes.targetLanguageId, node: TreeNode) {
    const compilerNode = this._getCompilerNodes().find(node => (<any>node).getTargetExtension() === targetLanguage)
    if (!compilerNode) throw new Error(`No compiler for language "${targetLanguage}" for line "${node.getLine()}"`)
    return compilerNode
  }

  protected _getCompilerNodes() {
    return <GrammarCompilerNode[]>this.getChildrenByNodeConstructor(GrammarCompilerNode) || []
  }

  // todo: remove?
  // for now by convention first compiler is "target extension"
  getTargetExtension() {
    const firstNode = this._getCompilerNodes()[0]
    return firstNode ? firstNode.getTargetExtension() : ""
  }

  private _cache_runTimeFirstWordToNodeConstructorMap: jTreeTypes.firstWordToNodeConstructorMap

  getRunTimeFirstWordMap() {
    this._initRunTimeFirstWordToNodeConstructorMap()
    return this._cache_runTimeFirstWordToNodeConstructorMap
  }

  getRunTimeNodeTypeNames() {
    return Object.keys(this.getRunTimeFirstWordMap())
  }

  getRunTimeFirstWordMapWithDefinitions() {
    const defs = this._getProgramNodeTypeDefinitionCache()
    return TreeUtils.mapValues<GrammarNodeTypeDefinitionNode>(this.getRunTimeFirstWordMap(), key => defs[key])
  }

  getRequiredCellTypeNames(): string[] {
    const parameters = this.get(GrammarConstants.cells)
    return parameters ? parameters.split(" ") : []
  }

  getCatchAllCellTypeName(): string | undefined {
    return this.get(GrammarConstants.catchAllCellType)
  }

  protected _initRunTimeFirstWordToNodeConstructorMap(): void {
    if (this._cache_runTimeFirstWordToNodeConstructorMap) return undefined
    // todo: make this handle extensions.
    const nodeTypesInScope = this._getNodeTypesInScope()

    this._cache_runTimeFirstWordToNodeConstructorMap = {}
    // terminals dont have acceptable firstWords
    if (!nodeTypesInScope.length) return undefined

    const allProgramNodeTypeDefinitionsMap = this._getProgramNodeTypeDefinitionCache()
    const nodeTypeIds = Object.keys(allProgramNodeTypeDefinitionsMap)
    nodeTypeIds
      .filter(nodeTypeId => allProgramNodeTypeDefinitionsMap[nodeTypeId].isOrExtendsANodeTypeInScope(nodeTypesInScope))
      .filter(nodeTypeId => !allProgramNodeTypeDefinitionsMap[nodeTypeId]._isAbstract())
      .forEach(nodeTypeId => {
        this._cache_runTimeFirstWordToNodeConstructorMap[nodeTypeId] = allProgramNodeTypeDefinitionsMap[nodeTypeId].getConstructorDefinedInGrammar()
      })
  }

  // todo: protected?
  _getNodeTypesInScope(): string[] {
    const nodeTypesNode = this._getNodeTypesNode()
    return nodeTypesNode ? nodeTypesNode.getFirstWords() : []
  }

  getTopNodeTypeIds() {
    const definitions = this._getProgramNodeTypeDefinitionCache()
    const firstWords = this.getRunTimeFirstWordMap()
    const arr = Object.keys(firstWords).map(firstWord => definitions[firstWord])
    arr.sort(TreeUtils.sortByAccessor((definition: GrammarNodeTypeDefinitionNode) => definition.getFrequency()))
    arr.reverse()
    return arr.map(definition => definition.getNodeTypeIdFromDefinition())
  }

  protected _getNodeTypesNode(): TreeNode {
    // todo: allow multiple of these if we allow mixins?
    return <TreeNode>this.getNode(GrammarConstants.nodeTypes)
  }

  isRequired(): boolean {
    GrammarConstants
    return this.has(GrammarConstants.required)
  }

  isSingle(): boolean {
    return this.has(GrammarConstants.single)
  }

  // todo: protected?
  _getRunTimeCatchAllNodeTypeId(): string {
    return ""
  }

  getNodeTypeDefinitionByName(firstWord: string): AbstractGrammarDefinitionNode {
    const definitions = this._getProgramNodeTypeDefinitionCache()
    return definitions[firstWord] || this._getCatchAllDefinition() // todo: this is where we might do some type of firstWord lookup for user defined fns.
  }

  _getCatchAllDefinition(): AbstractGrammarDefinitionNode {
    const catchAllNodeTypeId = this._getRunTimeCatchAllNodeTypeId()
    const definitions = this._getProgramNodeTypeDefinitionCache()
    const def = definitions[catchAllNodeTypeId]
    if (def) return def

    // todo: implement contraints like a grammar file MUST have a catch all.
    if (this.isRoot()) throw new Error(`This grammar language "${this.getProgram().getGrammarName()}" lacks a root catch all definition`)
    else return (<AbstractGrammarDefinitionNode>this.getParent())._getCatchAllDefinition()
  }

  private _cache_catchAllConstructor: jTreeTypes.RunTimeNodeConstructor

  protected _initCatchAllNodeConstructorCache(): void {
    if (this._cache_catchAllConstructor) return undefined

    this._cache_catchAllConstructor = this._getCatchAllDefinition().getConstructorDefinedInGrammar()
  }

  getFirstCellType(): string {
    return this.get(GrammarConstants.firstCellType) || GrammarStandardCellTypes.anyFirstWord
  }

  isDefined(firstWord: string) {
    return !!this._getProgramNodeTypeDefinitionCache()[firstWord.toLowerCase()]
  }

  // todo: protected?
  _getProgramNodeTypeDefinitionCache(): { [firstWord: string]: GrammarNodeTypeDefinitionNode } {
    return this.getProgram()._getProgramNodeTypeDefinitionCache()
  }

  getRunTimeCatchAllNodeConstructor() {
    this._initCatchAllNodeConstructorCache()
    return this._cache_catchAllConstructor
  }
}

export default AbstractGrammarDefinitionNode
