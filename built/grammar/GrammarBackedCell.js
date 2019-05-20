"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GrammarConstants_1 = require("./GrammarConstants");
/*
A cell contains a word but also the type information for that word.
*/
class AbstractGrammarBackedCell {
    constructor(node, index, typeDef, cellTypeName, isCatchAll) {
        this._typeDef = typeDef;
        this._node = node;
        this._isCatchAll = isCatchAll;
        this._index = index;
        this._cellTypeName = cellTypeName;
        this._word = node.getWord(index);
        this._grammarProgram = node.getDefinition().getProgram();
    }
    getCellTypeName() {
        return this._cellTypeName;
    }
    _getProgram() {
        return this._node.getProgram();
    }
    isCatchAll() {
        return this._isCatchAll;
    }
    getHighlightScope() {
        const definition = this._getCellTypeDefinition();
        if (definition)
            return definition.getHighlightScope();
    }
    getAutoCompleteWords(partialWord) {
        const definition = this._getCellTypeDefinition();
        let words = definition ? definition.getAutocompleteWordOptions(this._getProgram()) : [];
        const runTimeOptions = this._node.getRunTimeEnumOptions(this);
        if (runTimeOptions)
            words = runTimeOptions.concat(words);
        if (partialWord)
            words = words.filter(word => word.includes(partialWord));
        return words.map(word => {
            return {
                text: word,
                displayText: word
            };
        });
    }
    getWord() {
        return this._word;
    }
    _getCellTypeDefinition() {
        return this._typeDef;
    }
    _getLineNumber() {
        return this._node.getPoint().y;
    }
    _getFullLine() {
        return this._node.getLine();
    }
    _getErrorContext() {
        return this._getFullLine().split(" ")[0]; // todo: XI
    }
    _getExpectedLineCellTypes() {
        return this._node.getDefinition().getExpectedLineCellTypes();
    }
    isValid() {
        const runTimeOptions = this._node.getRunTimeEnumOptions(this);
        if (runTimeOptions)
            return runTimeOptions.includes(this._word);
        return this._getCellTypeDefinition().isValid(this._word, this._getProgram()) && this._isValid();
    }
    getErrorIfAny() {
        if (this._word !== undefined && this.isValid())
            return undefined;
        if (this._word === undefined)
            return {
                kind: GrammarConstants_1.GrammarConstantsErrors.unfilledColumnError,
                subkind: this.getCellTypeName(),
                level: this._index,
                context: this._getErrorContext(),
                message: `${GrammarConstants_1.GrammarConstantsErrors.unfilledColumnError} "${this.getCellTypeName()}" cellType in "${this._getFullLine()}" at line ${this._getLineNumber()} word ${this._index}. Expected line cell types: "${this._getExpectedLineCellTypes()}". definition: ${this._node
                    .getDefinition()
                    .toString()}`
            };
        return {
            kind: GrammarConstants_1.GrammarConstantsErrors.invalidWordError,
            subkind: this.getCellTypeName(),
            level: this._index,
            context: this._getErrorContext(),
            message: `${GrammarConstants_1.GrammarConstantsErrors.invalidWordError} in "${this._getFullLine()}" at line ${this._getLineNumber()} column ${this._index}. "${this._word}" does not fit in "${this.getCellTypeName()}" cellType. Expected line cell types: "${this._getExpectedLineCellTypes()}".`
        };
    }
}
exports.AbstractGrammarBackedCell = AbstractGrammarBackedCell;
class GrammarIntCell extends AbstractGrammarBackedCell {
    _isValid() {
        const num = parseInt(this._word);
        if (isNaN(num))
            return false;
        return num.toString() === this._word;
    }
    getRegexString() {
        return "\-?[0-9]+";
    }
    getParsed() {
        return parseInt(this._word);
    }
}
exports.GrammarIntCell = GrammarIntCell;
class GrammarBitCell extends AbstractGrammarBackedCell {
    _isValid() {
        const str = this._word;
        return str === "0" || str === "1";
    }
    getRegexString() {
        return "[01]";
    }
    getParsed() {
        return !!parseInt(this._word);
    }
}
exports.GrammarBitCell = GrammarBitCell;
class GrammarFloatCell extends AbstractGrammarBackedCell {
    _isValid() {
        return !isNaN(parseFloat(this._word));
    }
    getRegexString() {
        return "\-?[0-9]*\.?[0-9]*";
    }
    getParsed() {
        return parseFloat(this._word);
    }
}
exports.GrammarFloatCell = GrammarFloatCell;
// ErrorCellType => grammar asks for a '' cell type here but the grammar does not specify a '' cell type. (todo: bring in didyoumean?)
class GrammarBoolCell extends AbstractGrammarBackedCell {
    constructor() {
        super(...arguments);
        this._trues = new Set(["1", "true", "t", "yes"]);
        this._falses = new Set(["0", "false", "f", "no"]);
    }
    _isValid() {
        const str = this._word.toLowerCase();
        return this._trues.has(str) || this._falses.has(str);
    }
    _getOptions() {
        return Array.from(this._trues).concat(Array.from(this._falses));
    }
    getRegexString() {
        return "(?:" + this._getOptions().join("|") + ")";
    }
    getParsed() {
        return this._trues.has(this._word.toLowerCase());
    }
}
exports.GrammarBoolCell = GrammarBoolCell;
class GrammarAnyCell extends AbstractGrammarBackedCell {
    _isValid() {
        return true;
    }
    getRegexString() {
        return "[^ ]+";
    }
    getParsed() {
        return this._word;
    }
}
exports.GrammarAnyCell = GrammarAnyCell;
class GrammarExtraWordCellTypeCell extends AbstractGrammarBackedCell {
    _isValid() {
        return false;
    }
    getParsed() {
        return this._word;
    }
    getErrorIfAny() {
        return {
            kind: GrammarConstants_1.GrammarConstantsErrors.extraWordError,
            subkind: "",
            level: this._index,
            context: this._getErrorContext(),
            message: `${GrammarConstants_1.GrammarConstantsErrors.extraWordError} "${this._word}" in "${this._getFullLine()}" at line ${this._getLineNumber()} word ${this._index}. Expected line cell types: "${this._getExpectedLineCellTypes()}".`
        };
    }
}
exports.GrammarExtraWordCellTypeCell = GrammarExtraWordCellTypeCell;
class GrammarUnknownCellTypeCell extends AbstractGrammarBackedCell {
    _isValid() {
        return false;
    }
    getParsed() {
        return this._word;
    }
    getErrorIfAny() {
        return {
            kind: GrammarConstants_1.GrammarConstantsErrors.grammarDefinitionError,
            subkind: this.getCellTypeName(),
            level: this._index,
            context: this._getErrorContext(),
            message: `${GrammarConstants_1.GrammarConstantsErrors.grammarDefinitionError} For word "${this._word}" no cellType "${this.getCellTypeName()}" in grammar "${this._grammarProgram.getExtensionName()}" found in "${this._getFullLine()}" on line ${this._getLineNumber()} word ${this._index}. Expected line cell types: "${this._getExpectedLineCellTypes()}".`
        };
    }
}
exports.GrammarUnknownCellTypeCell = GrammarUnknownCellTypeCell;
