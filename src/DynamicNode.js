const TreeNode = require("./TreeNode.js")
const GrammarConstants = require("./grammar/GrammarConstants.js")
const TreeCell = require("./TreeCell.js")

class DynamicNode extends TreeNode {
  getProgram() {
    return this.getParent().getProgram()
  }

  getDefinition() {
    return this.getProgram()
      .getGrammarProgram()
      .getDefinitionByKeywordPath(this.getKeywordPath())
  }

  _getParameterMap() {
    const cells = this.getTreeCellArray()
    const parameterMap = {}
    cells.forEach(cell => {
      const type = cell.getType()
      if (!parameterMap[type]) parameterMap[type] = []
      parameterMap[type].push(cell.getWord())
    })
    return parameterMap
  }

  getCompiledIndentation() {
    const definition = this.getDefinition()
    const compiledIndentCharacter = definition.findBeam(GrammarConstants.compiledIndentCharacter)
    const indent = this.getIndentation()
    return compiledIndentCharacter !== undefined ? compiledIndentCharacter.repeat(indent.length) : indent
  }

  getCompiledLine() {
    const definition = this.getDefinition()
    const listDelimiter = definition.findBeam(GrammarConstants.listDelimiter)
    const parameterMap = this._getParameterMap()
    const jsStr = definition.findBeam(GrammarConstants.compiled)
    return jsStr ? DynamicNode._formatStr(jsStr, listDelimiter, parameterMap) : this.getLine()
  }

  compile() {
    return this.getCompiledIndentation() + this.getCompiledLine()
  }

  getErrors() {
    // Not enough parameters
    // Too many parameters
    // Incorrect parameter

    const errors = this.getTreeCellArray()
      .filter(wordCheck => wordCheck.getErrorMessage())
      .map(check => check.getErrorMessage())

    return errors
  }

  getTreeCellArray() {
    const point = this.getPoint()
    const definition = this.getDefinition()
    const parameters = definition.getBeamParameters()
    const parameterLength = parameters.length
    const lastParameterType = parameters[parameterLength - 1]
    const lastParameterListType = lastParameterType && lastParameterType.endsWith("*") ? lastParameterType : undefined
    const words = this.getWords(1)
    const length = Math.max(words.length, parameterLength)
    const checks = []
    for (let index = 0; index < length; index++) {
      const word = words[index]
      const type = index >= parameterLength ? lastParameterListType : parameters[index]
      checks[index] = new TreeCell(word, type, this, point.y, index)
    }
    return checks
  }

  // todo: just make a fn that computes proper spacing and then is given a node to print
  getWordTypeLine() {
    const parameterWords = this.getTreeCellArray().map(slot => slot.getType())
    return ["keyword"].concat(parameterWords).join(" ")
  }

  static _formatStr(str, listDelimiter = " ", parameterMap) {
    return str.replace(/{([^\}]+)}/g, (match, path) => {
      const isList = path.endsWith("*")
      const typePath = path.replace("*", "")
      const arr = parameterMap[typePath]
      if (!arr) return ""
      const word = isList ? arr.join(listDelimiter) : arr.shift()
      return word
    })
  }
}

module.exports = DynamicNode
