import TreeNode from "../base/TreeNode"
import TreeUtils from "../base/TreeUtils"
import { GrammarConstants } from "./GrammarConstants"
import { GrammarIntCell, GrammarBitCell, GrammarFloatCell, GrammarBoolCell, GrammarAnyCell } from "./GrammarBackedCell"
import types from "../types"

// todo: add standard types, enum types, from disk types

/*FOR_TYPES_ONLY*/ import AbstractRuntimeProgram from "./AbstractRuntimeProgram"

abstract class AbstractGrammarWordTestNode extends TreeNode {
  abstract isValid(str: string, program?: any): boolean
}

class GrammarRegexTestNode extends AbstractGrammarWordTestNode {
  private _regex

  isValid(str: string) {
    if (!this._regex) this._regex = new RegExp("^" + this.getContent() + "$")
    return !!str.match(this._regex)
  }
}

// todo: remove in favor of custom word type constructors
class EnumFromGrammarTestNode extends AbstractGrammarWordTestNode {
  _getKeywordTable(runTimeGrammarBackedProgram: AbstractRuntimeProgram): types.stringMap {
    const nodeType = this.getWord(1)
    // note: hack where we store it on the program. otherwise has global effects.
    if (!(<any>runTimeGrammarBackedProgram)._keywordTables) (<any>runTimeGrammarBackedProgram)._keywordTables = {}
    if ((<any>runTimeGrammarBackedProgram)._keywordTables[nodeType])
      return (<any>runTimeGrammarBackedProgram)._keywordTables[nodeType]

    // keywordTable cellType 1
    const wordIndex = 1
    const table = {}
    runTimeGrammarBackedProgram.findNodes(nodeType).forEach(node => {
      table[node.getWord(wordIndex)] = true
    })
    ;(<any>runTimeGrammarBackedProgram)._keywordTables[nodeType] = table
    return table
  }

  // todo: remove
  isValid(str: string, runTimeGrammarBackedProgram) {
    return this._getKeywordTable(runTimeGrammarBackedProgram)[str] === true
  }
}

class GrammarEnumTestNode extends AbstractGrammarWordTestNode {
  private _map
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
  getKeywordMap() {
    const types: types.stringMap = {}
    types[GrammarConstants.regex] = GrammarRegexTestNode
    types[GrammarConstants.enumFromGrammar] = EnumFromGrammarTestNode
    types[GrammarConstants.enum] = GrammarEnumTestNode
    types[GrammarConstants.highlightScope] = TreeNode
    return types
  }

  getCellConstructor() {
    const kinds = {
      any: GrammarAnyCell,
      float: GrammarFloatCell,
      number: GrammarFloatCell,
      bit: GrammarBitCell,
      bool: GrammarBoolCell,
      int: GrammarIntCell
    }
    return kinds[this.getWord(1)] || kinds[this.getWord(2)] || GrammarAnyCell
  }

  getHighlightScope(): string | undefined {
    return this.get(GrammarConstants.highlightScope)
  }

  private _getEnumOptions() {
    const enumNode = this.getChildrenByNodeType(GrammarEnumTestNode)[0]
    if (!enumNode) return undefined

    // we sort by longest first to capture longest match first. todo: add test
    const options = Object.keys(enumNode.getOptions())
    options.sort((a, b) => b.length - a.length)

    return options
  }

  private _getKeywordTableOptions(runTimeProgram: AbstractRuntimeProgram) {
    const node = <EnumFromGrammarTestNode>this.getNode(GrammarConstants.enumFromGrammar)
    return node ? Object.keys(node._getKeywordTable(runTimeProgram)) : undefined
  }

  getAutocompleteWordOptions(runTimeProgram: AbstractRuntimeProgram): string[] {
    return this._getEnumOptions() || this._getKeywordTableOptions(runTimeProgram) || []
  }

  getRegexString() {
    // todo: enum
    const enumOptions = this._getEnumOptions()
    return this.get(GrammarConstants.regex) || (enumOptions ? "(?:" + enumOptions.join("|") + ")" : "[^ ]*")
  }

  isValid(str: string, runTimeGrammarBackedProgram) {
    return this.getChildrenByNodeType(AbstractGrammarWordTestNode).every(node =>
      (<AbstractGrammarWordTestNode>node).isValid(str, runTimeGrammarBackedProgram)
    )
  }

  getCellTypeId() {
    return this.getWord(1)
  }

  public static types: any
}

export default GrammarCellTypeDefinitionNode
