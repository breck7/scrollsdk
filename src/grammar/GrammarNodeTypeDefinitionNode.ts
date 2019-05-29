import TreeNode from "../base/TreeNode"
import TreeUtils from "../base/TreeUtils"

import { GrammarConstants } from "./GrammarConstants"
import GrammarConstantsNode from "./GrammarConstantsNode"
import GrammarExampleNode from "./GrammarExampleNode"
import AbstractGrammarDefinitionNode from "./AbstractGrammarDefinitionNode"

/*FOR_TYPES_ONLY*/ import GrammarProgram from "./GrammarProgram"

import jTreeTypes from "../jTreeTypes"

class GrammarNodeTypeDefinitionNode extends AbstractGrammarDefinitionNode {
  // todo: protected?
  _getRunTimeCatchAllNodeTypeId(): string {
    return this.get(GrammarConstants.catchAllNodeType) || (<AbstractGrammarDefinitionNode>this.getParent())._getRunTimeCatchAllNodeTypeId()
  }

  getExpectedLineCellTypes() {
    const req = [this.getFirstCellType()].concat(this.getRequiredCellTypeNames())
    const catchAllCellType = this.getCatchAllCellTypeName()
    if (catchAllCellType) req.push(catchAllCellType + "*")
    return req.join(" ")
  }

  isOrExtendsANodeTypeInScope(firstWordsInScope: string[]): boolean {
    const chain = this.getNodeTypeInheritanceSet()
    return firstWordsInScope.some(firstWord => chain.has(firstWord))
  }

  getSublimeSyntaxContextId() {
    return this.getNodeTypeIdFromDefinition().replace(/\#/g, "HASH") // # is not allowed in sublime context names
  }

  private _getFirstCellHighlightScope() {
    const program = this.getProgram()
    const cellTypeDefinition = program.getCellTypeDefinition(this.getFirstCellType())
    // todo: standardize error/capture error at grammar time
    if (!cellTypeDefinition) throw new Error(`No ${GrammarConstants.cellType} ${this.getFirstCellType()} found`)
    return cellTypeDefinition.getHighlightScope()
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
    const requiredCellTypeNames = this.getRequiredCellTypeNames()
    const catchAllCellTypeName = this.getCatchAllCellTypeName()
    if (catchAllCellTypeName) requiredCellTypeNames.push(catchAllCellTypeName)
    if (!requiredCellTypeNames.length) return topHalf
    const captures = requiredCellTypeNames
      .map((typeName, index) => {
        const cellTypeDefinition = program.getCellTypeDefinition(typeName) // todo: cleanup
        if (!cellTypeDefinition) throw new Error(`No ${GrammarConstants.cellType} ${typeName} found`) // todo: standardize error/capture error at grammar time
        return `        ${index + 1}: ${(cellTypeDefinition.getHighlightScope() || defaultHighlightScope) + "." + cellTypeDefinition.getCellTypeId()}`
      })
      .join("\n")

    const cellTypesToRegex = (cellTypeNames: string[]) => cellTypeNames.map((cellTypeName: string) => `({{${cellTypeName}}})?`).join(" ?")

    return `${topHalf}
    push:
     - match: ${cellTypesToRegex(requiredCellTypeNames)}
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

  getAncestorNodeTypeNamesArray(): jTreeTypes.nodeTypeId[] {
    this._initNodeTypeInheritanceCache()
    return this._cache_ancestorNodeTypeIdsArray
  }

  protected _initNodeTypeInheritanceCache(): void {
    if (this._cache_nodeTypeInheritanceSet) return undefined
    let nodeTypeNames: jTreeTypes.nodeTypeId[] = []
    const extendedNodeTypeId = this._getIdOfNodeTypeThatThisExtends()
    if (extendedNodeTypeId) {
      const defs = this._getProgramNodeTypeDefinitionCache()
      const parentDef = defs[extendedNodeTypeId]
      if (!parentDef) throw new Error(`${extendedNodeTypeId} not found`)

      nodeTypeNames = nodeTypeNames.concat(parentDef.getAncestorNodeTypeNamesArray())
    }
    nodeTypeNames.push(this.getNodeTypeIdFromDefinition())
    this._cache_nodeTypeInheritanceSet = new Set(nodeTypeNames)
    this._cache_ancestorNodeTypeIdsArray = nodeTypeNames
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

  getExamples(): GrammarExampleNode[] {
    return this.getChildrenByNodeConstructor(GrammarExampleNode)
  }

  getConstantsObject() {
    const constantsNode = this.getNodeByType(GrammarConstantsNode)
    return constantsNode ? (<GrammarConstantsNode>constantsNode).getConstantsObj() : {}
  }

  getFrequency() {
    const val = this.get(GrammarConstants.frequency)
    return val ? parseFloat(val) : 0
  }
}

export default GrammarNodeTypeDefinitionNode
