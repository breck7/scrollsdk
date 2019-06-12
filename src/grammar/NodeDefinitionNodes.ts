import TreeNode from "../base/TreeNode"
import TreeUtils from "../base/TreeUtils"

import { GrammarConstants, GrammarStandardCellTypeIds } from "./GrammarConstants"
import GrammarCustomConstructorsNode from "./GrammarCustomConstructorsNode"
import GrammarCompilerNode from "./GrammarCompilerNode"
import GrammarConstantsNode from "./GrammarConstantsNode"

import { AbstractRuntimeProgramRootNode, GrammarBackedTerminalNode, GrammarBackedNonTerminalNode, GrammarBackedBlobNode } from "./AbstractRuntimeNodes"

import jTreeTypes from "../jTreeTypes"

import { UnknownNodeTypeError, BlankLineError } from "./TreeErrorTypes"

import GrammarCellTypeDefinitionNode from "./GrammarCellTypeDefinitionNode"
import AbstractRuntimeProgramConstructorInterface from "./AbstractRuntimeProgramConstructorInterface"

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

class GrammarNodeTypeDefinitionNode extends AbstractGrammarDefinitionNode {
  // todo: protected?
  _getRunTimeCatchAllNodeTypeId(): string {
    return this.get(GrammarConstants.catchAllNodeType) || (<AbstractGrammarDefinitionNode>this.getParent())._getRunTimeCatchAllNodeTypeId()
  }

  isOrExtendsANodeTypeInScope(firstWordsInScope: string[]): boolean {
    const chain = this.getNodeTypeInheritanceSet()
    return firstWordsInScope.some(firstWord => chain.has(firstWord))
  }

  getSublimeSyntaxContextId() {
    return this.getNodeTypeIdFromDefinition().replace(/\#/g, "HASH") // # is not allowed in sublime context names
  }

  getConstantsObject() {
    const constantsNode = this.getNode(GrammarConstants.constants)
    return constantsNode ? (<GrammarConstantsNode>constantsNode).getConstantsObj() : {}
  }

  private _getFirstCellHighlightScope() {
    const program = this.getProgram()
    const cellTypeDefinition = program.getCellTypeDefinitionById(this.getFirstCellTypeId())
    // todo: standardize error/capture error at grammar time
    if (!cellTypeDefinition) throw new Error(`No ${GrammarConstants.cellType} ${this.getFirstCellTypeId()} found`)
    return cellTypeDefinition.getHighlightScope()
  }

  protected _getParentDefinition(): AbstractGrammarDefinitionNode {
    const extendsId = this._getExtendedNodeTypeId()
    return extendsId ? this.getNodeTypeDefinitionByNodeTypeId(extendsId) : undefined
  }

  getMatchBlock() {
    const defaultHighlightScope = "source"
    const program = this.getProgram()
    const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    const firstWordHighlightScope = (this._getFirstCellHighlightScope() || defaultHighlightScope) + "." + this.getNodeTypeIdFromDefinition()
    const match = `'^ *${escapeRegExp(this.getNodeTypeIdFromDefinition())}(?: |$)'`
    const topHalf = ` '${this.getSublimeSyntaxContextId()}':
  - match: ${match}
    scope: ${firstWordHighlightScope}`
    const requiredCellTypeIds = this.getRequiredCellTypeIds()
    const catchAllCellTypeId = this.getCatchAllCellTypeId()
    if (catchAllCellTypeId) requiredCellTypeIds.push(catchAllCellTypeId)
    if (!requiredCellTypeIds.length) return topHalf
    const captures = requiredCellTypeIds
      .map((cellTypeId, index) => {
        const cellTypeDefinition = program.getCellTypeDefinitionById(cellTypeId) // todo: cleanup
        if (!cellTypeDefinition) throw new Error(`No ${GrammarConstants.cellType} ${cellTypeId} found`) // todo: standardize error/capture error at grammar time
        return `        ${index + 1}: ${(cellTypeDefinition.getHighlightScope() || defaultHighlightScope) + "." + cellTypeDefinition.getCellTypeId()}`
      })
      .join("\n")

    const cellTypesToRegex = (cellTypeIds: string[]) => cellTypeIds.map((cellTypeId: string) => `({{${cellTypeId}}})?`).join(" ?")

    return `${topHalf}
    push:
     - match: ${cellTypesToRegex(requiredCellTypeIds)}
       captures:
${captures}
     - match: $
       pop: true`
  }

  private _cache_nodeTypeInheritanceSet: Set<jTreeTypes.nodeTypeId>
  private _cache_ancestorNodeTypeIdsArray: jTreeTypes.nodeTypeId[]

  getNodeTypeInheritanceSet() {
    this._initNodeTypeInheritanceCache()
    return this._cache_nodeTypeInheritanceSet
  }

  private _getIdOfNodeTypeThatThisExtends() {
    return this.getWord(2)
  }

  getAncestorNodeTypeIdsArray(): jTreeTypes.nodeTypeId[] {
    this._initNodeTypeInheritanceCache()
    return this._cache_ancestorNodeTypeIdsArray
  }

  protected _initNodeTypeInheritanceCache(): void {
    if (this._cache_nodeTypeInheritanceSet) return undefined
    let nodeTypeIds: jTreeTypes.nodeTypeId[] = []
    const extendedNodeTypeId = this._getIdOfNodeTypeThatThisExtends()
    if (extendedNodeTypeId) {
      const defs = this._getProgramNodeTypeDefinitionCache()
      const parentDef = defs[extendedNodeTypeId]
      if (!parentDef) throw new Error(`${extendedNodeTypeId} not found`)

      nodeTypeIds = nodeTypeIds.concat(parentDef.getAncestorNodeTypeIdsArray())
    }
    nodeTypeIds.push(this.getNodeTypeIdFromDefinition())
    this._cache_nodeTypeInheritanceSet = new Set(nodeTypeIds)
    this._cache_ancestorNodeTypeIdsArray = nodeTypeIds
  }

  // todo: protected?
  _getProgramNodeTypeDefinitionCache() {
    return this.getProgram()._getProgramNodeTypeDefinitionCache()
  }

  getDoc() {
    return this.getNodeTypeIdFromDefinition()
  }

  private _getDefaultsNode() {
    return this.getNode(GrammarConstants.defaults)
  }

  // todo: deprecate?
  getDefaultFor(name: string) {
    const defaults = this._getDefaultsNode()
    return defaults ? defaults.get(name) : undefined
  }

  getDescription(): string {
    return this.get(GrammarConstants.description) || ""
  }

  getFrequency() {
    const val = this.get(GrammarConstants.frequency)
    return val ? parseFloat(val) : 0
  }

  private _getExtendedNodeTypeId(): jTreeTypes.nodeTypeId {
    const ancestorIds = this.getAncestorNodeTypeIdsArray()
    if (ancestorIds.length > 1) return ancestorIds[ancestorIds.length - 2]
  }

  _toJavascript(): jTreeTypes.javascriptCode {
    const ancestorIds = this.getAncestorNodeTypeIdsArray()
    const extendedNodeTypeId = this._getExtendedNodeTypeId()
    const extendsClass = extendedNodeTypeId ? this.getNodeTypeDefinitionByNodeTypeId(extendedNodeTypeId).getGeneratedClassName() : "jtree.NonTerminalNode"

    const components = [this.getNodeConstructorToJavascript(), this.getGetters().join("\n")].filter(code => code)

    return `class ${this.getGeneratedClassName()} extends ${extendsClass} {
      ${components.join("\n")}
    }`
  }
}

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
    map[GrammarConstants.toolingDirective] = TreeNode
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

  getCellTypeDefinitionById(cellTypeId: jTreeTypes.cellTypeId) {
    // todo: return unknownCellTypeDefinition? or is that handled somewhere else?
    return this.getCellTypeDefinitions()[cellTypeId]
  }

  getNodeTypeFamilyTree() {
    const tree = new TreeNode()
    Object.values(this.getNodeTypeDefinitions()).forEach(node => {
      const path = node.getAncestorNodeTypeIdsArray().join(" ")
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

  protected _getInScopeNodeTypeIds(): jTreeTypes.nodeTypeId[] {
    const nodeTypesNode = this._getGrammarRootNode().getNode(GrammarConstants.inScope)
    return nodeTypesNode ? nodeTypesNode.getWordsFrom(1) : []
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
      if (!def) def = <AbstractGrammarDefinitionNode>subject._getCatchAllNodeTypeDefinition()
      subject = def
    }

    this._cachedDefinitions[firstWordPath] = def
    return def
  }

  getDocs() {
    return this.toString()
  }

  // At present we only have global nodeType definitions (you cannot have scoped nodeType definitions right now).
  private _cache_nodeTypeDefinitions: { [nodeTypeId: string]: GrammarNodeTypeDefinitionNode }

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
    const extendedConstructor: any = this._getGrammarRootNode().getConstructorDefinedInGrammar() || AbstractRuntimeProgramRootNode
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

  toNodeJsJavascript(jtreePath = "jtree"): jTreeTypes.javascriptCode {
    return this._toJavascript(jtreePath, true)
  }

  toBrowserJavascript(): jTreeTypes.javascriptCode {
    return this._toJavascript("", false)
  }

  private _getRootClassName() {
    return this.getExtensionName() + "Program"
  }

  private _toJavascript(jtreePath: string, forNodeJs = true): jTreeTypes.javascriptCode {
    const nodeTypeClasses = this.getNodeTypeDefinitions()
      .map(def => def._toJavascript())
      .join("\n\n")

    const components = [this.getNodeConstructorToJavascript()].filter(code => code)
    const rootClass = `class ${this._getRootClassName()} extends jtree.programRoot {
  getGrammarProgram() {}
  ${components.join("\n")}
    }`

    return `${forNodeJs ? `const jtree = require("${jtreePath}")` : ""}

${nodeTypeClasses}

${rootClass}

${forNodeJs ? "module.exports = " + this._getRootClassName() : ""}
`
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

  static _condensedToExpanded(grammarCode: string) {
    // todo: handle imports
    const tree = new TreeNode(grammarCode)

    // Expand groups
    // todo: rename? maybe change this to something like "makeNodeTypes"?
    // todo: where is this used? if we had imports, would that be a better solution?
    const xi = tree.getXI()
    tree.findNodes(`${GrammarConstants.abstract}${xi}${GrammarConstants.group}`).forEach(group => {
      const abstractName = group.getParent().getWord(1)
      group
        .getContent()
        .split(xi)
        .forEach(word => tree.appendLine(`${GrammarConstants.nodeType}${xi}${word}${xi}${abstractName}`))
    })

    // todo: only expand certain types.
    // inScope should be a set.
    tree._expandChildren(1, 2, tree.filter(node => node.getFirstWord() !== GrammarConstants.toolingDirective))
    return tree
  }

  static newFromCondensed(grammarCode: string, grammarPath?: jTreeTypes.filepath) {
    return new GrammarProgram(this._condensedToExpanded(grammarCode), grammarPath)
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

export { AbstractGrammarDefinitionNode, GrammarNodeTypeDefinitionNode, GrammarProgram }
