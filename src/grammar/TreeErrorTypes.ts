import jTreeTypes from "../jTreeTypes"
import TreeNode from "../base/TreeNode"
import TreeUtils from "../base/TreeUtils"

/*FOR_TYPES_ONLY*/ import AbstractRuntimeNode from "./AbstractRuntimeNode"
/*FOR_TYPES_ONLY*/ import { AbstractGrammarBackedCell } from "./GrammarBackedCell"

abstract class AbstractTreeError implements jTreeTypes.TreeError {
  constructor(node: AbstractRuntimeNode | TreeNode) {
    this._node = node
  }
  private _node: AbstractRuntimeNode | TreeNode

  getLineIndex(): jTreeTypes.positiveInt {
    return this.getLineNumber() - 1
  }

  getLineNumber(): jTreeTypes.positiveInt {
    return this.getNode().getPoint().y
  }

  getLine() {
    return this.getNode().getLine()
  }

  getExtension() {
    return (<AbstractRuntimeNode>this.getNode()).getGrammarProgram().getExtensionName()
  }

  getNode() {
    return this._node
  }

  getErrorTypeName() {
    return this.constructor.name
  }

  getCellIndex() {
    return 0
  }

  toObject() {
    return {
      type: this.getErrorTypeName(),
      line: this.getLineNumber(),
      cell: this.getCellIndex(),
      suggestion: this.getSuggestionMessage(),
      path: this.getNode().getFirstWordPath(),
      message: this.getMessage()
    }
  }

  hasSuggestion() {
    return this.getSuggestionMessage() !== ""
  }

  getSuggestionMessage() {
    return ""
  }

  applySuggestion() {}

  getMessage(): string {
    return `${this.getErrorTypeName()} at line ${this.getLineNumber()} cell ${this.getCellIndex()}.`
  }
}

abstract class AbstractCellError extends AbstractTreeError {
  constructor(cell: AbstractGrammarBackedCell<any>) {
    super(cell.getNode())
    this._cell = cell
  }

  getCell() {
    return this._cell
  }

  getCellIndex() {
    return this._cell.getCellIndex()
  }

  protected _getWordSuggestion() {
    return TreeUtils.didYouMean(
      this.getCell().getWord(),
      this.getCell()
        .getAutoCompleteWords()
        .map(option => option.text)
    )
  }

  private _cell: AbstractGrammarBackedCell<any>
}

abstract class FirstWordError extends AbstractTreeError {}

class UnknownNodeTypeError extends FirstWordError {
  getMessage(): string {
    return super.getMessage() + ` Invalid nodeType "${this.getNode().getFirstWord()}".`
  }

  protected _getWordSuggestion() {
    const node = this.getNode()
    const parentNode = node.getParent()
    return TreeUtils.didYouMean(node.getFirstWord(), (<AbstractRuntimeNode>parentNode).getAutocompleteResults("", 0).map(option => option.text))
  }

  getSuggestionMessage() {
    const suggestion = this._getWordSuggestion()

    if (suggestion) return `Did you mean "${suggestion}"`

    return ""
  }
}

class InvalidConstructorPathError extends AbstractTreeError {
  getMessage(): string {
    return super.getMessage() + ` No constructor "${this.getLine()}" found. Language grammar "${this.getExtension()}" may need to be fixed.`
  }
}

class MissingRequiredNodeTypeError extends AbstractTreeError {
  constructor(node: AbstractRuntimeNode | TreeNode, missingWord: jTreeTypes.firstWord) {
    super(node)
    this._missingWord = missingWord
  }

  getMessage(): string {
    return super.getMessage() + ` Missing "${this._missingWord}" found.`
  }

  getSuggestionMessage() {
    return `Insert "${this._missingWord}" on line "${this.getLineNumber() + 1}"`
  }

  applySuggestion() {
    return this.getNode().prependLine(this._missingWord)
  }

  private _missingWord: string
}

class NodeTypeUsedMultipleTimesError extends AbstractTreeError {
  getMessage(): string {
    return super.getMessage() + ` Multiple "${this.getNode().getFirstWord()}" found.`
  }

  getSuggestionMessage() {
    return `Delete line ${this.getLineNumber()}`
  }

  applySuggestion() {
    return this.getNode().destroy()
  }
}

class UnknownCellTypeError extends AbstractCellError {
  getMessage(): string {
    return super.getMessage() + ` No cellType "${this.getCell().getCellTypeName()}" found. Language grammar for "${this.getExtension()}" may need to be fixed.`
  }
}

class InvalidWordError extends AbstractCellError {
  getMessage(): string {
    return super.getMessage() + ` "${this.getCell().getWord()}" does not fit in cellType "${this.getCell().getCellTypeName()}".`
  }

  getSuggestionMessage() {
    const suggestion = this._getWordSuggestion()

    if (suggestion) return `Did you mean "${suggestion}"`

    return ""
  }
}

class ExtraWordError extends AbstractCellError {
  getMessage(): string {
    return super.getMessage() + ` Extra word "${this.getCell().getWord()}".`
  }

  getSuggestionMessage() {
    return `Delete word "${this.getCell().getWord()}" at cell ${this.getCellIndex()}`
  }

  applySuggestion() {
    return this.getNode().deleteWordAt(this.getCellIndex())
  }
}

class MissingWordError extends AbstractCellError {
  // todo: autocomplete suggestion

  getMessage(): string {
    return super.getMessage() + ` Missing word for cell "${this.getCell().getCellTypeName()}".`
  }
}

export {
  UnknownNodeTypeError,
  InvalidConstructorPathError,
  InvalidWordError,
  UnknownCellTypeError,
  ExtraWordError,
  MissingWordError,
  MissingRequiredNodeTypeError,
  NodeTypeUsedMultipleTimesError
}
