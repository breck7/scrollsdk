import jTreeTypes from "../jTreeTypes"

class Parser {
  // todo: should getErrors be under here? At least for certain types of errors?
  private _catchAllNodeConstructor: jTreeTypes.TreeNodeConstructor
  private _firstWordMap: jTreeTypes.firstWordToNodeConstructorMap
  private _regexTests: jTreeTypes.regexTest[]
  constructor(
    catchAllNodeConstructor: jTreeTypes.TreeNodeConstructor,
    firstWordMap: jTreeTypes.firstWordToNodeConstructorMap = {},
    regexTests: jTreeTypes.regexTest[] = undefined
  ) {
    this._catchAllNodeConstructor = catchAllNodeConstructor
    this._firstWordMap = firstWordMap
    this._regexTests = regexTests
  }

  getFirstWordOptions() {
    return Object.keys(this._firstWordMap)
  }

  // todo: remove
  _getFirstWordMap() {
    return this._firstWordMap
  }

  _getNodeConstructor(line: string, contextNode: jTreeTypes.treeNode, zi = " "): jTreeTypes.TreeNodeConstructor {
    return this._firstWordMap[this._getFirstWord(line, zi)] || this._getConstructorFromRegexTests(line) || this._getCatchAllNodeConstructor(contextNode)
  }

  _getCatchAllNodeConstructor(contextNode: jTreeTypes.treeNode) {
    if (this._catchAllNodeConstructor) return this._catchAllNodeConstructor

    const parent = contextNode.getParent()

    if (parent) return parent._getParser()._getCatchAllNodeConstructor(parent)

    return contextNode.constructor
  }

  private _getConstructorFromRegexTests(line: string): jTreeTypes.TreeNodeConstructor {
    if (!this._regexTests) return undefined
    const hit = this._regexTests.find(test => test.regex.test(line))
    if (hit) return hit.nodeConstructor
    return undefined
  }

  private _getFirstWord(line: string, zi: string) {
    const firstBreak = line.indexOf(zi)
    return line.substr(0, firstBreak > -1 ? firstBreak : undefined)
  }
}

export default Parser
