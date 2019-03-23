import TreeNode from "../base/TreeNode"
import TreeUtils from "../base/TreeUtils"
import GrammarConstants from "./GrammarConstants"

// todo: add standard types, enum types, from disk types

abstract class AbstractGrammarWordTestNode extends TreeNode {
  abstract isValid(str: string, program?: any): boolean
}

class GrammarRegexTestNode extends AbstractGrammarWordTestNode {
  private _regex

  isValid(str) {
    if (!this._regex) this._regex = new RegExp("^" + this.getContent() + "$")
    return str.match(this._regex)
  }
}

class GrammarKeywordTableTestNode extends AbstractGrammarWordTestNode {
  protected _getKeywordTable(runTimeGrammarBackedProgram) {
    // @keywordTable @wordType 1
    const nodeType = this.getWord(1)
    const wordIndex = parseInt(this.getWord(2))
    const table = {}
    runTimeGrammarBackedProgram.findNodes(nodeType).forEach(node => {
      table[node.getWord(wordIndex)] = true
    })
    return table
  }

  private _keywordTable

  isValid(str, runTimeGrammarBackedProgram) {
    if (!this._keywordTable) this._keywordTable = this._getKeywordTable(runTimeGrammarBackedProgram)
    return this._keywordTable[str] === true
  }
}

class GrammarEnumTestNode extends AbstractGrammarWordTestNode {
  private _map
  isValid(str) {
    // @enum c c++ java
    return this.getOptions()[str]
  }

  getOptions() {
    if (!this._map) this._map = TreeUtils.arrayToMap(this.getWordsFrom(1))
    return this._map
  }
}

class GrammarWordParserNode extends TreeNode {
  parse(str) {
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

class GrammarWordTypeNode extends TreeNode {
  getKeywordMap() {
    const types = []
    types[GrammarConstants.regex] = GrammarRegexTestNode
    types[GrammarConstants.keywordTable] = GrammarKeywordTableTestNode
    types[GrammarConstants.enum] = GrammarEnumTestNode
    types[GrammarConstants.parseWith] = GrammarWordParserNode
    types[GrammarConstants.highlightScope] = TreeNode
    return types
  }

  getHighlightScope() {
    return this.get(GrammarConstants.highlightScope)
  }

  private _getEnumOptions() {
    const enumNode = this.getChildrenByNodeType(GrammarEnumTestNode)[0]
    return enumNode ? Object.keys(enumNode.getOptions()) : undefined
  }

  getRegexString() {
    // todo: enum
    const enumOptions = this._getEnumOptions()
    return (
      this.get(GrammarConstants.regex) || (enumOptions ? "(?:" + enumOptions.join("|") + ")" : "noWordTypeRegexFound")
    )
  }

  parse(str) {
    const parser = this.getNode(GrammarConstants.parseWith)
    return parser ? parser.parse(str) : str
  }

  isValid(str, runTimeGrammarBackedProgram) {
    str = str.replace(/\*$/, "") // todo: cleanup
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

class GrammarWordTypeIntNode extends GrammarWordTypeNode {
  isValid(str) {
    const num = parseInt(str)
    if (isNaN(num)) return false
    return num.toString() === str
  }

  getRegexString() {
    return "\-?[0-9]+"
  }

  parse(str) {
    return parseInt(str)
  }
}

class GrammarWordTypeBitNode extends GrammarWordTypeNode {
  isValid(str) {
    return str === "0" || str === "1"
  }

  getRegexString() {
    return "[01]"
  }

  parse(str) {
    return !!parseInt(str)
  }
}

class GrammarWordTypeFloatNode extends GrammarWordTypeNode {
  isValid(str) {
    return !isNaN(parseFloat(str))
  }

  getRegexString() {
    return "\-?[0-9]*\.?[0-9]*"
  }

  parse(str) {
    return parseFloat(str)
  }
}

class GrammarWordTypeBoolNode extends GrammarWordTypeNode {
  private _options = ["1", "0", "true", "false", "t", "f", "yes", "no"]

  isValid(str) {
    return new Set(this._options).has(str.toLowerCase())
  }

  getRegexString() {
    return "(?:" + this._options.join("|") + ")"
  }

  parse(str) {
    return !!parseInt(str)
  }
}

class GrammarWordTypeAnyNode extends GrammarWordTypeNode {
  isValid() {
    return true
  }

  getRegexString() {
    return "[^ ]+"
  }
}

GrammarWordTypeNode.types = {
  any: GrammarWordTypeAnyNode,
  float: GrammarWordTypeFloatNode,
  bit: GrammarWordTypeBitNode,
  bool: GrammarWordTypeBoolNode,
  int: GrammarWordTypeIntNode
}

export default GrammarWordTypeNode
