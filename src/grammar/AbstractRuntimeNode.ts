import TreeNode from "../base/TreeNode"
import { GrammarConstantsErrors } from "./GrammarConstants"
import { GrammarConstants } from "./GrammarConstants"

/*FOR_TYPES_ONLY*/ import GrammarProgram from "./GrammarProgram"
/*FOR_TYPES_ONLY*/ import { AbstractGrammarBackedCell } from "./GrammarBackedCell"
/*FOR_TYPES_ONLY*/ import AbstractGrammarDefinitionNode from "./AbstractGrammarDefinitionNode"
/*FOR_TYPES_ONLY*/ import GrammarNodeTypeDefinitionNode from "./GrammarNodeTypeDefinitionNode"

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
      ? this._getAutocompleteResultsForFirstWord(partialWord)
      : this._getAutocompleteResultsForCell(partialWord, cellIndex)
  }

  protected _getGrammarBackedCellArray(): AbstractGrammarBackedCell<any>[] {
    return []
  }

  getRunTimeEnumOptions(cell: AbstractGrammarBackedCell<any>): string[] {
    return undefined
  }

  private _getAutocompleteResultsForCell(partialWord: string, cellIndex: types.positiveInt) {
    // todo: root should be [] correct?
    const cell = this._getGrammarBackedCellArray()[cellIndex - 1]
    return cell ? cell.getAutoCompleteWords(partialWord) : []
  }

  private _getAutocompleteResultsForFirstWord(partialWord: string) {
    const def = this.getDefinition()
    let defs: GrammarNodeTypeDefinitionNode[] = Object.values(def.getRunTimeFirstWordMapWithDefinitions())

    if (partialWord) defs = defs.filter(def => def.getNodeTypeIdFromDefinition().includes(partialWord))

    return defs.map(def => {
      const id = def.getNodeTypeIdFromDefinition()
      const description = def.getDescription()
      return {
        text: id,
        displayText: id + (description ? " " + description : "")
      }
    })
  }

  abstract getDefinition(): AbstractGrammarDefinitionNode

  protected _getNodeTypeDefinitionByName(path: string) {
    // todo: do we need a relative to with this firstWord path?
    return this.getProgram()
      .getGrammarProgram()
      .getNodeTypeDefinitionByFirstWordPath(path)
  }

  protected _getRequiredNodeErrors(errors: types.ParseError[] = []) {
    const nodeDef = this.getDefinition()
    const firstWords = nodeDef.getRunTimeFirstWordMapWithDefinitions()
    Object.keys(firstWords).forEach(firstWord => {
      const def = firstWords[firstWord]
      if (def.isRequired() && !this.has(firstWord)) {
        errors.push({
          kind: GrammarConstantsErrors.missingRequiredNodeTypeError,
          subkind: firstWord,
          level: 0,
          context: "",
          message: `${
            GrammarConstantsErrors.missingRequiredNodeTypeError
          } Required nodeType missing: "${firstWord}" in node '${this.getLine()}' at line '${this.getPoint().y}'`
        })
      }
    })
    return errors
  }
}

export default AbstractRuntimeNode
