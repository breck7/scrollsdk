const TreeNode = require("../base/TreeNode.js")
const TreeUtils = require("../base/TreeUtils.js")

const GrammarConstants = require("./GrammarConstants.js")

const GrammarBackedCell = require("./GrammarBackedCell.js")

class GrammarBackedNode extends TreeNode {
  getProgram() {
    return this.getParent().getProgram()
  }

  getDefinition() {
    return this.getProgram()
      .getGrammarProgram()
      .getDefinitionByKeywordPath(this.getKeywordPath())
  }

  getCompilerNode(targetLanguage) {
    return this.getDefinition().getDefinitionCompilerNode(targetLanguage, this)
  }

  _getParameterMap() {
    const cells = this.getGrammarBackedCellArray()
    const parameterMap = {}
    cells.forEach(cell => {
      const type = cell.getType()
      if (!parameterMap[type]) parameterMap[type] = []
      parameterMap[type].push(cell.getWord())
    })
    return parameterMap
  }

  getCompiledIndentation(targetLanguage) {
    const compiler = this.getCompilerNode(targetLanguage)
    const indentCharacter = compiler.getIndentCharacter()
    const indent = this.getIndentation()
    return indentCharacter !== undefined ? indentCharacter.repeat(indent.length) : indent
  }

  getCompiledLine(targetLanguage) {
    const compiler = this.getCompilerNode(targetLanguage)
    const listDelimiter = compiler.getListDelimiter()
    const parameterMap = this._getParameterMap()
    const str = compiler.getTransformation()
    return str ? TreeUtils.formatStr(str, listDelimiter, parameterMap) : this.getLine()
  }

  compile(targetLanguage) {
    return this.getCompiledIndentation(targetLanguage) + this.getCompiledLine(targetLanguage)
  }

  getErrors() {
    // Not enough parameters
    // Too many parameters
    // Incorrect parameter

    const errors = this.getGrammarBackedCellArray()
      .filter(wordCheck => wordCheck.getErrorMessage())
      .map(check => check.getErrorMessage())

    return errors
  }

  getGrammarBackedCellArray() {
    const point = this.getPoint()
    const definition = this.getDefinition()
    const parameters = definition.getBeamParameters()
    const parameterLength = parameters.length
    const lastParameterType = parameters[parameterLength - 1]
    const lastParameterListType = lastParameterType && lastParameterType.endsWith("*") ? lastParameterType : undefined
    const words = this.getWordsFrom(1)
    const length = Math.max(words.length, parameterLength)
    const checks = []
    for (let index = 0; index < length; index++) {
      const word = words[index]
      const type = index >= parameterLength ? lastParameterListType : parameters[index]
      checks[index] = new GrammarBackedCell(word, type, this, point.y, index)
    }
    return checks
  }

  // todo: just make a fn that computes proper spacing and then is given a node to print
  getLineSyntax() {
    const parameterWords = this.getGrammarBackedCellArray().map(slot => slot.getType())
    return ["keyword"].concat(parameterWords).join(" ")
  }
}

module.exports = GrammarBackedNode
