import TreeNode from "../base/TreeNode"
import TreeUtils from "../base/TreeUtils"
import { GrammarConstants } from "./GrammarConstants"
import types from "../types"

// todo: add standard types, enum types, from disk types

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
class GrammarKeywordTableTestNode extends AbstractGrammarWordTestNode {
  protected _getKeywordTable(runTimeGrammarBackedProgram) {
    // keywordTable cellType 1
    const nodeType = this.getWord(1)
    const wordIndex = parseInt(this.getWord(2))
    const table = {}
    runTimeGrammarBackedProgram.findNodes(nodeType).forEach(node => {
      table[node.getWord(wordIndex)] = true
    })
    return table
  }

  // todo: remove
  isValid(str: string, runTimeGrammarBackedProgram) {
    // note: hack where we store it on the program. otherwise has global effects.
    if (!runTimeGrammarBackedProgram._keywordTable)
      runTimeGrammarBackedProgram._keywordTable = this._getKeywordTable(runTimeGrammarBackedProgram)
    return runTimeGrammarBackedProgram._keywordTable[str] === true
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

class GrammarWordParserNode extends TreeNode {
  parse(str: string) {
    const fns = {
      parseInt: parseInt,
      parseFloat: parseFloat
    }
    const fnName = this.getWord(2)
    const fn = fns[fnName]
    if (fn) return fn(str)
    return str
  }
}

class GrammarCellTypeNode extends TreeNode {
  getKeywordMap() {
    const types: types.stringMap = {}
    types[GrammarConstants.regex] = GrammarRegexTestNode
    types[GrammarConstants.keywordTable] = GrammarKeywordTableTestNode
    types[GrammarConstants.enum] = GrammarEnumTestNode
    types[GrammarConstants.parseWith] = GrammarWordParserNode
    types[GrammarConstants.highlightScope] = TreeNode
    return types
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

  getAutocompleteWordOptions(): string[] {
    const enumOptions = this._getEnumOptions()
    return enumOptions || []
  }

  getRegexString() {
    // todo: enum
    const enumOptions = this._getEnumOptions()
    return this.get(GrammarConstants.regex) || (enumOptions ? "(?:" + enumOptions.join("|") + ")" : "[^ ]*")
  }

  parse(str: string) {
    const parser = this.getNode(GrammarConstants.parseWith)
    return parser ? parser.parse(str) : str
  }

  isValid(str: string, runTimeGrammarBackedProgram) {
    return this.getChildrenByNodeType(AbstractGrammarWordTestNode).every(node =>
      (<AbstractGrammarWordTestNode>node).isValid(str, runTimeGrammarBackedProgram)
    )
  }

  getId() {
    return this.getWord(1)
  }

  getTypeId() {
    return this.getWord(1)
  }

  public static types: any
}

class GrammarCellTypeIntNode extends GrammarCellTypeNode {
  isValid(str: string) {
    const num = parseInt(str)
    if (isNaN(num)) return false
    return num.toString() === str
  }

  getRegexString() {
    return "\-?[0-9]+"
  }

  parse(str: string) {
    return parseInt(str)
  }
}

class GrammarCellTypeBitNode extends GrammarCellTypeNode {
  isValid(str: string) {
    return str === "0" || str === "1"
  }

  getRegexString() {
    return "[01]"
  }

  parse(str: string) {
    return !!parseInt(str)
  }
}

class GrammarCellTypeFloatNode extends GrammarCellTypeNode {
  isValid(str: string) {
    return !isNaN(parseFloat(str))
  }

  getRegexString() {
    return "\-?[0-9]*\.?[0-9]*"
  }

  parse(str: string) {
    return parseFloat(str)
  }
}

class GrammarCellTypeBoolNode extends GrammarCellTypeNode {
  private _options = ["1", "0", "true", "false", "t", "f", "yes", "no"]

  isValid(str: string) {
    return new Set(this._options).has(str.toLowerCase())
  }

  getRegexString() {
    return "(?:" + this._options.join("|") + ")"
  }

  parse(str: string) {
    return !!parseInt(str)
  }
}

class GrammarCellTypeAnyNode extends GrammarCellTypeNode {
  isValid() {
    return true
  }

  getRegexString() {
    return "[^ ]+"
  }
}

GrammarCellTypeNode.types = {
  any: GrammarCellTypeAnyNode,
  float: GrammarCellTypeFloatNode,
  bit: GrammarCellTypeBitNode,
  bool: GrammarCellTypeBoolNode,
  int: GrammarCellTypeIntNode
}

export default GrammarCellTypeNode
