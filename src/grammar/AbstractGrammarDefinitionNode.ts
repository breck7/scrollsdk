import TreeNode from "../base/TreeNode"
import TreeUtils from "../base/TreeUtils"

import { GrammarConstants, GrammarStandardCellTypeIds } from "./GrammarConstants"
import GrammarCustomConstructorsNode from "./GrammarCustomConstructorsNode"
import GrammarCompilerNode from "./GrammarCompilerNode"
import GrammarConstantsNode from "./GrammarConstantsNode"

import { GrammarBackedTerminalNode, GrammarBackedNonTerminalNode, GrammarBackedBlobNode } from "./GrammarBackedNodes"

/*FOR_TYPES_ONLY*/ import GrammarProgram from "./GrammarProgram"
/*FOR_TYPES_ONLY*/ import GrammarNodeTypeDefinitionNode from "./GrammarNodeTypeDefinitionNode"

import jTreeTypes from "../jTreeTypes"

import { UnknownNodeTypeError, BlankLineError } from "./TreeErrorTypes"

class GrammarDefinitionErrorNode extends TreeNode {
  getErrors(): jTreeTypes.TreeError[] {
    return [this.getFirstWord() ? new UnknownNodeTypeError(this) : new BlankLineError(this)]
  }

  getLineCellTypes() {
    return [<string>GrammarConstants.nodeType].concat(this.getWordsFrom(1).map(word => GrammarStandardCellTypeIds.any)).join(" ")
  }
}

class GrammarExampleNode extends TreeNode {}

abstract class AbstractGrammarDefinitionNode extends TreeNode {
  getFirstWordMap(): jTreeTypes.firstWordToNodeConstructorMap {
    const types = [
      GrammarConstants.frequency,
      GrammarConstants.inScope,
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

  getExamples(): GrammarExampleNode[] {
    return this.getChildrenByNodeConstructor(GrammarExampleNode)
  }

  getNodeTypeIdFromDefinition(): jTreeTypes.nodeTypeId {
    return this.getWord(1)
  }

  getGeneratedClassName() {
    let javascriptSyntaxSafeId = this.getNodeTypeIdFromDefinition()
    javascriptSyntaxSafeId = javascriptSyntaxSafeId.replace(/(\..)/g, letter => letter[1].toUpperCase())
    // todo: remove this? switch to allowing nodeTypeDefs to have a match attribute or something?
    javascriptSyntaxSafeId = javascriptSyntaxSafeId.replace(/\+/g, "plus")
    javascriptSyntaxSafeId = javascriptSyntaxSafeId.replace(/\-/g, "minus")
    javascriptSyntaxSafeId = javascriptSyntaxSafeId.replace(/\%/g, "mod")
    javascriptSyntaxSafeId = javascriptSyntaxSafeId.replace(/\//g, "div")
    javascriptSyntaxSafeId = javascriptSyntaxSafeId.replace(/\*/g, "mult")
    javascriptSyntaxSafeId = javascriptSyntaxSafeId.replace(/\#/g, "hash")
    javascriptSyntaxSafeId = javascriptSyntaxSafeId.replace(/\!/g, "bang")
    return `${javascriptSyntaxSafeId}Node`
  }

  getNodeConstructorToJavascript(): string {
    const nodeMap = this.getRunTimeFirstWordMapWithDefinitions()

    // if THIS node defines a catch all constructor, use that
    // IF IT DOES NOT, ADD NOTHING
    // if THIS node defines a keyword map, use that first
    // IF IT DOES NOT, ADD NOTHING
    // CHECK PARENTS TOO
    const firstWordMap = this._createRunTimeFirstWordToNodeConstructorMap(this._getMyInScopeNodeTypeIds())

    if (firstWordMap)
      return `getFirstWordMap() {
  return {${Object.keys(firstWordMap).map(firstWord => `"${firstWord}" : ${nodeMap[firstWord].getGeneratedClassName()}`)}}
  }`
  }

  protected _isNonTerminal() {
    return this._isBlobNode() || this.has(GrammarConstants.inScope) || this.has(GrammarConstants.catchAllNodeType)
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
    if (!this._cache_runTimeFirstWordToNodeConstructorMap)
      this._cache_runTimeFirstWordToNodeConstructorMap = this._createRunTimeFirstWordToNodeConstructorMap(this._getInScopeNodeTypeIds())
    return this._cache_runTimeFirstWordToNodeConstructorMap
  }

  getRunTimeFirstWordsInScope(): jTreeTypes.nodeTypeId[] {
    return Object.keys(this.getRunTimeFirstWordMap())
  }

  getRunTimeFirstWordMapWithDefinitions() {
    const defs = this._getProgramNodeTypeDefinitionCache()
    return TreeUtils.mapValues<GrammarNodeTypeDefinitionNode>(this.getRunTimeFirstWordMap(), key => defs[key])
  }

  getRequiredCellTypeIds(): jTreeTypes.cellTypeId[] {
    const parameters = this.get(GrammarConstants.cells)
    return parameters ? parameters.split(" ") : []
  }

  getGetters() {
    const requireds = this.getRequiredCellTypeIds().map(
      (cellTypeId, index) => `get ${cellTypeId}() {
      return this.getWord(${index + 1})
    }`
    )

    const catchAllCellTypeId = this.getCatchAllCellTypeId()
    if (catchAllCellTypeId)
      requireds.push(`get ${catchAllCellTypeId}() {
      return this.getWordsFrom(${requireds.length + 1})
    }`)

    return requireds
  }

  getCatchAllCellTypeId(): jTreeTypes.cellTypeId | undefined {
    return this.get(GrammarConstants.catchAllCellType)
  }

  protected _createRunTimeFirstWordToNodeConstructorMap(nodeTypeIdsInScope: jTreeTypes.nodeTypeId[]): jTreeTypes.firstWordToNodeConstructorMap {
    if (!nodeTypeIdsInScope.length) return {}

    const result: jTreeTypes.firstWordToNodeConstructorMap = {}

    const allProgramNodeTypeDefinitionsMap = this._getProgramNodeTypeDefinitionCache()
    Object.keys(allProgramNodeTypeDefinitionsMap)
      .filter(nodeTypeId => allProgramNodeTypeDefinitionsMap[nodeTypeId].isOrExtendsANodeTypeInScope(nodeTypeIdsInScope))
      .filter(nodeTypeId => !allProgramNodeTypeDefinitionsMap[nodeTypeId]._isAbstract())
      .forEach(nodeTypeId => {
        result[nodeTypeId] = allProgramNodeTypeDefinitionsMap[nodeTypeId].getConstructorDefinedInGrammar()
      })
    return result
  }

  getTopNodeTypeIds(): jTreeTypes.nodeTypeId[] {
    const definitions = this._getProgramNodeTypeDefinitionCache()
    const firstWords = this.getRunTimeFirstWordMap()
    const arr = Object.keys(firstWords).map(firstWord => definitions[firstWord])
    arr.sort(TreeUtils.sortByAccessor((definition: GrammarNodeTypeDefinitionNode) => definition.getFrequency()))
    arr.reverse()
    return arr.map(definition => definition.getNodeTypeIdFromDefinition())
  }

  protected _getParentDefinition(): AbstractGrammarDefinitionNode {
    return undefined
  }

  protected _getMyInScopeNodeTypeIds(): jTreeTypes.nodeTypeId[] {
    const nodeTypesNode = this.getNode(GrammarConstants.inScope)
    return nodeTypesNode ? nodeTypesNode.getWordsFrom(1) : []
  }

  protected _getInScopeNodeTypeIds(): jTreeTypes.nodeTypeId[] {
    // todo: allow multiple of these if we allow mixins?
    const ids = this._getMyInScopeNodeTypeIds()
    const parentDef = this._getParentDefinition()
    return parentDef ? ids.concat(parentDef._getInScopeNodeTypeIds()) : ids
  }

  isRequired(): boolean {
    return this.has(GrammarConstants.required)
  }

  _shouldBeJustOne(): boolean {
    return this.has(GrammarConstants.single)
  }

  // todo: protected?
  _getRunTimeCatchAllNodeTypeId(): jTreeTypes.nodeTypeId {
    return ""
  }

  getNodeTypeDefinitionByNodeTypeId(nodeTypeId: jTreeTypes.nodeTypeId): AbstractGrammarDefinitionNode {
    const definitions = this._getProgramNodeTypeDefinitionCache()
    return definitions[nodeTypeId] || this._getCatchAllNodeTypeDefinition() // todo: this is where we might do some type of firstWord lookup for user defined fns.
  }

  _getCatchAllNodeTypeDefinition(): AbstractGrammarDefinitionNode {
    const catchAllNodeTypeId = this._getRunTimeCatchAllNodeTypeId()
    const definitions = this._getProgramNodeTypeDefinitionCache()
    const def = definitions[catchAllNodeTypeId]
    if (def) return def

    // todo: implement contraints like a grammar file MUST have a catch all.
    if (this.isRoot()) throw new Error(`This grammar language "${this.getProgram().getGrammarName()}" lacks a root catch all definition`)
    else return (<AbstractGrammarDefinitionNode>this.getParent())._getCatchAllNodeTypeDefinition()
  }

  private _cache_catchAllConstructor: jTreeTypes.RunTimeNodeConstructor

  protected _initCatchAllNodeConstructorCache(): void {
    if (this._cache_catchAllConstructor) return undefined

    this._cache_catchAllConstructor = this._getCatchAllNodeTypeDefinition().getConstructorDefinedInGrammar()
  }

  getFirstCellTypeId(): jTreeTypes.cellTypeId {
    return this.get(GrammarConstants.firstCellType) || GrammarStandardCellTypeIds.anyFirstWord
  }

  isDefined(nodeTypeId: string) {
    return !!this._getProgramNodeTypeDefinitionCache()[nodeTypeId.toLowerCase()]
  }

  // todo: protected?
  _getProgramNodeTypeDefinitionCache(): { [nodeTypeId: string]: GrammarNodeTypeDefinitionNode } {
    return this.getProgram()._getProgramNodeTypeDefinitionCache()
  }

  getRunTimeCatchAllNodeConstructor() {
    this._initCatchAllNodeConstructorCache()
    return this._cache_catchAllConstructor
  }
}

export default AbstractGrammarDefinitionNode
