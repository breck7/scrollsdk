import TreeNode from "../base/TreeNode"
import { GrammarConstantsErrors } from "./GrammarConstants"
import { GrammarConstants } from "./GrammarConstants"

/*FOR_TYPES_ONLY*/ import GrammarProgram from "./GrammarProgram"
/*FOR_TYPES_ONLY*/ import GrammarBackedCell from "./GrammarBackedCell"
/*FOR_TYPES_ONLY*/ import AbstractGrammarDefinitionNode from "./AbstractGrammarDefinitionNode"
/*FOR_TYPES_ONLY*/ import GrammarKeywordDefinitionNode from "./GrammarKeywordDefinitionNode"

import types from "../types"

abstract class AbstractRuntimeNode extends TreeNode {
  // note: this is overwritten by the root node of a runtime grammar program.
  // some of the magic that makes this all work. but maybe there's a better way.
  getGrammarProgram(): GrammarProgram {
    return this.getProgram().getGrammarProgram()
  }

  getCatchAllNodeConstructor(line: string) {
    return this.getDefinition().getRunTimeCatchAllNodeConstructor()
  }

  getProgram(): AbstractRuntimeNode {
    return this
  }

  getAutocompleteResults(partialWord: string, cellIndex: types.positiveInt) {
    return cellIndex === 0
      ? this._getAutocompleteResultsForKeywords(partialWord)
      : this._getAutocompleteResultsForCell(partialWord, cellIndex)
  }

  protected _getGrammarBackedCellArray(): GrammarBackedCell[] {
    return []
  }

  private _getAutocompleteResultsForCell(partialWord: string, cellIndex: types.positiveInt) {
    // todo: root should be [] correct?
    const cell = this._getGrammarBackedCellArray()[cellIndex - 1]
    return cell ? cell.getAutoCompleteWords(partialWord) : []
  }

  private _getAutocompleteResultsForKeywords(partialWord: string) {
    const def = this.getDefinition()
    let defs: GrammarKeywordDefinitionNode[] = Object.values(def.getRunTimeKeywordMapWithDefinitions())

    if (partialWord) defs = defs.filter(def => def.getId().includes(partialWord))

    return defs.map(def => {
      const id = def.getId()
      const description = def.getDescription()
      return {
        text: id,
        displayText: id + (description ? " " + description : "")
      }
    })
  }

  abstract getDefinition(): AbstractGrammarDefinitionNode

  protected _getKeywordDefinitionByName(path: string) {
    const grammarProgram = this.getProgram().getGrammarProgram()
    // todo: do we need a relative to with this keyword path?
    return grammarProgram.getKeywordDefinitionByKeywordPath(path)
  }

  protected _getRequiredNodeErrors(errors = []) {
    const nodeDef = this.getDefinition()
    const keywords = nodeDef.getRunTimeKeywordMapWithDefinitions()
    Object.keys(keywords).forEach(keyword => {
      const def = keywords[keyword]
      if (def.isRequired() && !this.has(keyword)) {
        errors.push({
          kind: GrammarConstantsErrors.missingRequiredKeywordError,
          subkind: keyword,
          level: 0,
          context: 0,
          message: `${
            GrammarConstantsErrors.missingRequiredKeywordError
          } Required keyword missing: "${keyword}" in node '${this.getLine()}' at line '${this.getPoint().y}'`
        })
      }
    })
    return errors
  }
}

export default AbstractRuntimeNode
