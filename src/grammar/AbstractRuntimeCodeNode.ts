import TreeUtils from "../base/TreeUtils"

import { GrammarConstantsErrors } from "./GrammarConstants"

import GrammarBackedCell from "./GrammarBackedCell"
import AbstractRuntimeNode from "./AbstractRuntimeNode"

abstract class AbstractRuntimeCodeNode extends AbstractRuntimeNode {
  getProgram() {
    return (<AbstractRuntimeNode>this.getParent()).getProgram()
  }

  getGrammarProgram() {
    return this.getDefinition().getProgram()
  }

  getDefinition() {
    // todo: do we need a relative to with this keyword path?
    return this._getKeywordDefinitionByName(this.getKeywordPath())
  }

  getCompilerNode(targetLanguage) {
    return this.getDefinition().getDefinitionCompilerNode(targetLanguage, this)
  }

  getParsedWords() {
    return this._getGrammarBackedCellArray().map(word => word.getParsed())
  }

  protected _getParameterMap() {
    const cells = this._getGrammarBackedCellArray()
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

    const errors = this._getGrammarBackedCellArray()
      .map(check => check.getErrorIfAny())
      .filter(i => i)
    // More than one
    const definition = this.getDefinition()
    let times
    const keyword = this.getKeyword()
    if (definition.isSingle() && (times = this.getParent().findNodes(keyword).length) > 1)
      errors.push({
        kind: GrammarConstantsErrors.keywordUsedMultipleTimesError,
        subkind: keyword,
        level: 0,
        context: this.getParent().getLine(),
        message: `${
          GrammarConstantsErrors.keywordUsedMultipleTimesError
        } keyword "${keyword}" used '${times}' times. '${this.getLine()}' at line '${this.getPoint().y}'`
      })

    return this._getRequiredNodeErrors(errors)
  }

  protected _getGrammarBackedCellArray(): GrammarBackedCell[] {
    const definition = this.getDefinition()
    const grammarProgram = definition.getProgram()
    const columnTypes = definition.getNodeColumnTypes()
    const expectedLinePattern = columnTypes.join(" ")
    const numberOfColumns = columnTypes.length
    const lastColumnType = columnTypes[numberOfColumns - 1]
    const lastColumnListType = lastColumnType && lastColumnType.endsWith("*") ? lastColumnType : undefined
    const words = this.getWordsFrom(1)
    const length = Math.max(words.length, numberOfColumns)
    const checks = []
    // A for loop instead of map because "length" can be longer than words.length
    for (let wordIndex = 0; wordIndex < length; wordIndex++) {
      checks[wordIndex] = new GrammarBackedCell(
        words[wordIndex],
        wordIndex >= numberOfColumns ? lastColumnListType : columnTypes[wordIndex],
        this,
        wordIndex,
        expectedLinePattern,
        grammarProgram
      )
    }
    return checks
  }

  // todo: just make a fn that computes proper spacing and then is given a node to print
  getLineSyntax() {
    const parameterWords = this._getGrammarBackedCellArray().map(slot => slot.getType())
    return ["keyword"].concat(parameterWords).join(" ")
  }

  getLineHighlightScopes(defaultScope = "source") {
    const wordScopes = this._getGrammarBackedCellArray().map(slot => slot.getHighlightScope() || defaultScope)
    return [this.getDefinition().getHighlightScope() || defaultScope].concat(wordScopes).join(" ")
  }
}

export default AbstractRuntimeCodeNode
