import TreeNode from "../base/TreeNode"
import TreeUtils from "../base/TreeUtils"
import { GrammarConstants, GrammarStandardCellTypes } from "./GrammarConstants"
import { GrammarIntCell, GrammarBitCell, GrammarFloatCell, GrammarBoolCell, GrammarAnyCell } from "./GrammarBackedCell"
import jTreeTypes from "../jTreeTypes"

// todo: add standard types, enum types, from disk types

/*FOR_TYPES_ONLY*/ import AbstractRuntimeProgram from "./AbstractRuntimeProgram"

abstract class AbstractGrammarWordTestNode extends TreeNode {
  abstract isValid(str: string, program?: any): boolean
}

class GrammarRegexTestNode extends AbstractGrammarWordTestNode {
  private _regex: RegExp

  isValid(str: string) {
    if (!this._regex) this._regex = new RegExp("^" + this.getContent() + "$")
    return !!str.match(this._regex)
  }
}

// todo: remove in favor of custom word type constructors
class EnumFromGrammarTestNode extends AbstractGrammarWordTestNode {
  _getEnumFromGrammar(runTimeGrammarBackedProgram: AbstractRuntimeProgram): jTreeTypes.stringMap {
    const nodeType = this.getWord(1)
    // note: hack where we store it on the program. otherwise has global effects.
    if (!(<any>runTimeGrammarBackedProgram)._enumMaps) (<any>runTimeGrammarBackedProgram)._enumMaps = {}
    if ((<any>runTimeGrammarBackedProgram)._enumMaps[nodeType]) return (<any>runTimeGrammarBackedProgram)._enumMaps[nodeType]

    const wordIndex = 1
    const map: jTreeTypes.stringMap = {}
    runTimeGrammarBackedProgram.findNodes(nodeType).forEach(node => {
      map[node.getWord(wordIndex)] = true
    })
    ;(<any>runTimeGrammarBackedProgram)._enumMaps[nodeType] = map
    return map
  }

  // todo: remove
  isValid(str: string, runTimeGrammarBackedProgram: AbstractRuntimeProgram) {
    return this._getEnumFromGrammar(runTimeGrammarBackedProgram)[str] === true
  }
}

class GrammarEnumTestNode extends AbstractGrammarWordTestNode {
  private _map: jTreeTypes.stringMap

  isValid(str: string) {
    // enum c c++ java
    return !!this.getOptions()[str]
  }

  getOptions() {
    if (!this._map) this._map = TreeUtils.arrayToMap(this.getWordsFrom(1))
    return this._map
  }
}

class GrammarCellTypeDefinitionNode extends TreeNode {
  getFirstWordMap() {
    const types: jTreeTypes.stringMap = {}
    types[GrammarConstants.regex] = GrammarRegexTestNode
    types[GrammarConstants.enumFromGrammar] = EnumFromGrammarTestNode
    types[GrammarConstants.enum] = GrammarEnumTestNode
    types[GrammarConstants.highlightScope] = TreeNode
    return types
  }

  // todo: cleanup typings. todo: remove this hidden logic. have a "baseType" property?
  getCellConstructor() {
    const kinds: jTreeTypes.stringMap = {}
    kinds[GrammarStandardCellTypes.any] = GrammarAnyCell
    kinds[GrammarStandardCellTypes.anyFirstWord] = GrammarAnyCell
    kinds[GrammarStandardCellTypes.float] = GrammarFloatCell
    kinds[GrammarStandardCellTypes.number] = GrammarFloatCell
    kinds[GrammarStandardCellTypes.bit] = GrammarBitCell
    kinds[GrammarStandardCellTypes.bool] = GrammarBoolCell
    kinds[GrammarStandardCellTypes.int] = GrammarIntCell
    return kinds[this.getWord(1)] || kinds[this.getWord(2)] || GrammarAnyCell
  }

  getHighlightScope(): string | undefined {
    return this.get(GrammarConstants.highlightScope)
  }

  private _getEnumOptions() {
    const enumNode = this.getChildrenByNodeConstructor(GrammarEnumTestNode)[0]
    if (!enumNode) return undefined

    // we sort by longest first to capture longest match first. todo: add test
    const options = Object.keys(enumNode.getOptions())
    options.sort((a, b) => b.length - a.length)

    return options
  }

  private _getEnumFromGrammarOptions(runTimeProgram: AbstractRuntimeProgram) {
    const node = <EnumFromGrammarTestNode>this.getNode(GrammarConstants.enumFromGrammar)
    return node ? Object.keys(node._getEnumFromGrammar(runTimeProgram)) : undefined
  }

  getAutocompleteWordOptions(runTimeProgram: AbstractRuntimeProgram): string[] {
    return this._getEnumOptions() || this._getEnumFromGrammarOptions(runTimeProgram) || []
  }

  getRegexString() {
    // todo: enum
    const enumOptions = this._getEnumOptions()
    return this.get(GrammarConstants.regex) || (enumOptions ? "(?:" + enumOptions.join("|") + ")" : "[^ ]*")
  }

  isValid(str: string, runTimeGrammarBackedProgram: AbstractRuntimeProgram) {
    return this.getChildrenByNodeConstructor(AbstractGrammarWordTestNode).every(node =>
      (<AbstractGrammarWordTestNode>node).isValid(str, runTimeGrammarBackedProgram)
    )
  }

  getCellTypeId(): jTreeTypes.cellTypeId {
    return this.getWord(1)
  }

  public static types: any
}

export default GrammarCellTypeDefinitionNode
