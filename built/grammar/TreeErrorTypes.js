"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TreeUtils_1 = require("../base/TreeUtils");
class AbstractTreeError {
    constructor(node) {
        this._node = node;
    }
    getLineIndex() {
        return this.getLineNumber() - 1;
    }
    getLineNumber() {
        return this.getNode().getPoint().y;
    }
    // convenience method
    isBlankLineError() {
        return false;
    }
    getLine() {
        return this.getNode().getLine();
    }
    getExtension() {
        return this.getNode().getGrammarProgram().getExtensionName();
    }
    getNode() {
        return this._node;
    }
    getErrorTypeName() {
        return this.constructor.name.replace("Error", "");
    }
    getCellIndex() {
        return 0;
    }
    toObject() {
        return {
            type: this.getErrorTypeName(),
            line: this.getLineNumber(),
            cell: this.getCellIndex(),
            suggestion: this.getSuggestionMessage(),
            path: this.getNode().getFirstWordPath(),
            message: this.getMessage()
        };
    }
    hasSuggestion() {
        return this.getSuggestionMessage() !== "";
    }
    getSuggestionMessage() {
        return "";
    }
    applySuggestion() { }
    getMessage() {
        return `${this.getErrorTypeName()} at line ${this.getLineNumber()} cell ${this.getCellIndex()}.`;
    }
}
class AbstractCellError extends AbstractTreeError {
    constructor(cell) {
        super(cell.getNode());
        this._cell = cell;
    }
    getCell() {
        return this._cell;
    }
    getCellIndex() {
        return this._cell.getCellIndex();
    }
    _getWordSuggestion() {
        return TreeUtils_1.default.didYouMean(this.getCell().getWord(), this.getCell()
            .getAutoCompleteWords()
            .map(option => option.text));
    }
}
class FirstWordError extends AbstractTreeError {
}
class UnknownNodeTypeError extends FirstWordError {
    getMessage() {
        return super.getMessage() + ` Invalid nodeType "${this.getNode().getFirstWord()}".`;
    }
    _getWordSuggestion() {
        const node = this.getNode();
        const parentNode = node.getParent();
        return TreeUtils_1.default.didYouMean(node.getFirstWord(), parentNode.getAutocompleteResults("", 0).map(option => option.text));
    }
    getSuggestionMessage() {
        const suggestion = this._getWordSuggestion();
        const node = this.getNode();
        if (suggestion)
            return `Change "${node.getFirstWord()}" to "${suggestion}"`;
        return "";
    }
    applySuggestion() {
        const suggestion = this._getWordSuggestion();
        if (suggestion)
            this.getNode().setWord(this.getCellIndex(), suggestion);
        return this;
    }
}
exports.UnknownNodeTypeError = UnknownNodeTypeError;
class BlankLineError extends UnknownNodeTypeError {
    getMessage() {
        return super.getMessage() + ` Blank lines are errors.`;
    }
    // convenience method
    isBlankLineError() {
        return true;
    }
    getSuggestionMessage() {
        return `Delete line ${this.getLineNumber()}`;
    }
    applySuggestion() {
        this.getNode().destroy();
        return this;
    }
}
exports.BlankLineError = BlankLineError;
class InvalidConstructorPathError extends AbstractTreeError {
    getMessage() {
        return super.getMessage() + ` No constructor "${this.getLine()}" found. Language grammar "${this.getExtension()}" may need to be fixed.`;
    }
}
exports.InvalidConstructorPathError = InvalidConstructorPathError;
class MissingRequiredNodeTypeError extends AbstractTreeError {
    constructor(node, missingWord) {
        super(node);
        this._missingWord = missingWord;
    }
    getMessage() {
        return super.getMessage() + ` Missing "${this._missingWord}" found.`;
    }
    getSuggestionMessage() {
        return `Insert "${this._missingWord}" on line ${this.getLineNumber() + 1}`;
    }
    applySuggestion() {
        return this.getNode().prependLine(this._missingWord);
    }
}
exports.MissingRequiredNodeTypeError = MissingRequiredNodeTypeError;
class NodeTypeUsedMultipleTimesError extends AbstractTreeError {
    getMessage() {
        return super.getMessage() + ` Multiple "${this.getNode().getFirstWord()}" found.`;
    }
    getSuggestionMessage() {
        return `Delete line ${this.getLineNumber()}`;
    }
    applySuggestion() {
        return this.getNode().destroy();
    }
}
exports.NodeTypeUsedMultipleTimesError = NodeTypeUsedMultipleTimesError;
class UnknownCellTypeError extends AbstractCellError {
    getMessage() {
        return super.getMessage() + ` No cellType "${this.getCell().getCellTypeName()}" found. Language grammar for "${this.getExtension()}" may need to be fixed.`;
    }
}
exports.UnknownCellTypeError = UnknownCellTypeError;
class InvalidWordError extends AbstractCellError {
    getMessage() {
        return super.getMessage() + ` "${this.getCell().getWord()}" does not fit in cellType "${this.getCell().getCellTypeName()}".`;
    }
    getSuggestionMessage() {
        const suggestion = this._getWordSuggestion();
        if (suggestion)
            return `Change "${this.getCell().getWord()}" to "${suggestion}"`;
        return "";
    }
    applySuggestion() {
        const suggestion = this._getWordSuggestion();
        if (suggestion)
            this.getNode().setWord(this.getCellIndex(), suggestion);
        return this;
    }
}
exports.InvalidWordError = InvalidWordError;
class ExtraWordError extends AbstractCellError {
    getMessage() {
        return super.getMessage() + ` Extra word "${this.getCell().getWord()}".`;
    }
    getSuggestionMessage() {
        return `Delete word "${this.getCell().getWord()}" at cell ${this.getCellIndex()}`;
    }
    applySuggestion() {
        return this.getNode().deleteWordAt(this.getCellIndex());
    }
}
exports.ExtraWordError = ExtraWordError;
class MissingWordError extends AbstractCellError {
    // todo: autocomplete suggestion
    getMessage() {
        return super.getMessage() + ` Missing word for cell "${this.getCell().getCellTypeName()}".`;
    }
}
exports.MissingWordError = MissingWordError;
