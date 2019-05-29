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

  isCursorOnWord(lineIndex: jTreeTypes.positiveInt, characterIndex: jTreeTypes.positiveInt) {
    return lineIndex === this.getLineIndex() && this._doesCharacterIndexFallOnWord(characterIndex)
  }

  private _doesCharacterIndexFallOnWord(characterIndex: jTreeTypes.positiveInt) {
    return this.getCellIndex() === this.getNode().getWordIndexAtCharacterIndex(characterIndex)
  }

  // convenience method. may be removed.
  isBlankLineError() {
    return false
  }

  // convenience method. may be removed.
  isMissingWordError() {
    return false
  }

  getIndent() {
    return this.getNode().getIndentation()
  }

  getCodeMirrorLineWidgetElement(onApplySuggestionCallBack = () => {}) {
    const suggestion = this.getSuggestionMessage()
    if (this.isMissingWordError()) return this._getCodeMirrorLineWidgetElementCellTypeHints()
    if (suggestion) return this._getCodeMirrorLineWidgetElementWithSuggestion(onApplySuggestionCallBack, suggestion)
    return this._getCodeMirrorLineWidgetElementWithoutSuggestion()
  }

  private _getCodeMirrorLineWidgetElementCellTypeHints() {
    const el = document.createElement("div")
    el.appendChild(document.createTextNode(this.getIndent() + (<AbstractRuntimeNode>this.getNode()).getDefinition().getLineHints()))
    el.className = "LintCellTypeHints"
    return el
  }

  private _getCodeMirrorLineWidgetElementWithoutSuggestion() {
    const el = document.createElement("div")
    el.appendChild(document.createTextNode(this.getIndent() + this.getMessage()))
    el.className = "LintError"
    return el
  }

  private _getCodeMirrorLineWidgetElementWithSuggestion(onApplySuggestionCallBack: Function, suggestion: string) {
    const el = document.createElement("div")
    el.appendChild(document.createTextNode(this.getIndent() + `${this.getErrorTypeName()}. Suggestion: ${suggestion}`))
    el.className = "LintErrorWithSuggestion"
    el.onclick = () => {
      this.applySuggestion()
      onApplySuggestionCallBack()
    }
    return el
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
    return this.constructor.name.replace("Error", "")
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
    const node = this.getNode()

    if (suggestion) return `Change "${node.getFirstWord()}" to "${suggestion}"`

    return ""
  }

  applySuggestion() {
    const suggestion = this._getWordSuggestion()
    if (suggestion) this.getNode().setWord(this.getCellIndex(), suggestion)
    return this
  }
}

class BlankLineError extends UnknownNodeTypeError {
  getMessage(): string {
    return super.getMessage() + ` Blank lines are errors.`
  }

  // convenience method
  isBlankLineError() {
    return true
  }

  getSuggestionMessage() {
    return `Delete line ${this.getLineNumber()}`
  }

  applySuggestion() {
    this.getNode().destroy()
    return this
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
    return `Insert "${this._missingWord}" on line ${this.getLineNumber() + 1}`
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

    if (suggestion) return `Change "${this.getCell().getWord()}" to "${suggestion}"`

    return ""
  }

  applySuggestion() {
    const suggestion = this._getWordSuggestion()
    if (suggestion) this.getNode().setWord(this.getCellIndex(), suggestion)
    return this
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

  isMissingWordError() {
    return true
  }
}

export {
  UnknownNodeTypeError,
  BlankLineError,
  InvalidConstructorPathError,
  InvalidWordError,
  UnknownCellTypeError,
  ExtraWordError,
  MissingWordError,
  MissingRequiredNodeTypeError,
  NodeTypeUsedMultipleTimesError
}
