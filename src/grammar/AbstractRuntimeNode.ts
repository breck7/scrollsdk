import TreeNode from "../base/TreeNode"
import { GrammarConstants } from "./GrammarConstants"

/*FOR_TYPES_ONLY*/ import GrammarProgram from "./GrammarProgram"
/*FOR_TYPES_ONLY*/ import { AbstractGrammarBackedCell } from "./GrammarBackedCell"
/*FOR_TYPES_ONLY*/ import AbstractGrammarDefinitionNode from "./AbstractGrammarDefinitionNode"
/*FOR_TYPES_ONLY*/ import GrammarNodeTypeDefinitionNode from "./GrammarNodeTypeDefinitionNode"

import { MissingRequiredNodeTypeError } from "./TreeErrorTypes"

import jTreeTypes from "../jTreeTypes"

abstract class AbstractRuntimeNode extends TreeNode {
  // note: this is overwritten by the root node of a runtime grammar program.
  // some of the magic that makes this all work. but maybe there's a better way.
  getGrammarProgram(): GrammarProgram {
    return this.getProgram().getGrammarProgram()
  }

  getFirstWordMap() {
    return this.getDefinition().getRunTimeFirstWordMap()
  }

  getCatchAllNodeConstructor(line: string) {
    return this.getDefinition().getRunTimeCatchAllNodeConstructor()
  }

  getProgram(): AbstractRuntimeNode {
    return this
  }

  getAutocompleteResults(partialWord: string, cellIndex: jTreeTypes.positiveInt) {
    return cellIndex === 0 ? this._getAutocompleteResultsForFirstWord(partialWord) : this._getAutocompleteResultsForCell(partialWord, cellIndex)
  }

  protected _getGrammarBackedCellArray(): AbstractGrammarBackedCell<any>[] {
    return []
  }

  getRunTimeEnumOptions(cell: AbstractGrammarBackedCell<any>): string[] {
    return undefined
  }

  private _getAutocompleteResultsForCell(partialWord: string, cellIndex: jTreeTypes.positiveInt) {
    // todo: root should be [] correct?
    const cell = this._getGrammarBackedCellArray()[cellIndex]
    return cell ? cell.getAutoCompleteWords(partialWord) : []
  }

  private _getAutocompleteResultsForFirstWord(partialWord: string) {
    let defs: GrammarNodeTypeDefinitionNode[] = Object.values(this.getDefinition().getRunTimeFirstWordMapWithDefinitions())

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

  protected _getRequiredNodeErrors(errors: jTreeTypes.TreeError[] = []) {
    const firstWords = this.getDefinition().getRunTimeFirstWordMapWithDefinitions()
    Object.keys(firstWords).forEach(firstWord => {
      const def = firstWords[firstWord]
      if (def.isRequired() && !this.has(firstWord)) errors.push(new MissingRequiredNodeTypeError(this, firstWord))
    })
    return errors
  }
}

export default AbstractRuntimeNode
