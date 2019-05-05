"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GrammarConstants_1 = require("./GrammarConstants");
/*
A cell contains a word but also the type information for that word.
*/
class AbstractGrammarBackedCell {
    constructor(word, type, node, index, isCatchAll, expectedLinePattern, grammarProgram, runTimeProgram) {
        this._word = word;
        this._type = type;
        this._node = node;
        this._isCatchAll = isCatchAll;
        this._expectedLinePattern = expectedLinePattern;
        this._grammarProgram = grammarProgram;
        this._index = index + 1;
        this._program = runTimeProgram;
    }
    getCellTypeName() {
        return this._type ? this._type.getCellTypeId() : undefined;
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
        let words = definition ? definition.getAutocompleteWordOptions(this._program) : [];
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
        return this._type;
    }
    _getLineNumber() {
        return this._node.getPoint().y;
    }
    isValid() {
        const runTimeOptions = this._node.getRunTimeEnumOptions(this);
        if (runTimeOptions)
            return runTimeOptions.includes(this._word);
        return this._getCellTypeDefinition().isValid(this._word, this._node.getProgram()) && this._isValid();
    }
    getErrorIfAny() {
        const word = this._word;
        const index = this._index;
        const type = this.getCellTypeName();
        const fullLine = this._node.getLine();
        const line = this._getLineNumber();
        const context = fullLine.split(" ")[0]; // todo: XI
        if (word === undefined)
            return {
                kind: GrammarConstants_1.GrammarConstantsErrors.unfilledColumnError,
                subkind: type,
                level: index,
                context: context,
                message: `${GrammarConstants_1.GrammarConstantsErrors.unfilledColumnError} "${type}" cellType in "${fullLine}" at line ${line} word ${index}. Expected pattern: "${this._expectedLinePattern}". definition: ${this._node.getDefinition().toString()}`
            };
        const runTimeGrammarBackedProgram = this._node.getProgram();
        return this.isValid()
            ? undefined
            : {
                kind: GrammarConstants_1.GrammarConstantsErrors.invalidWordError,
                subkind: type,
                level: index,
                context: context,
                message: `${GrammarConstants_1.GrammarConstantsErrors.invalidWordError} in "${fullLine}" at line ${line} column ${index}. "${word}" does not fit in "${type}" cellType. Expected pattern: "${this._expectedLinePattern}".`
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
        const word = this._word;
        const index = this._index;
        const type = this.getCellTypeName();
        const fullLine = this._node.getLine();
        const line = this._getLineNumber();
        const context = fullLine.split(" ")[0]; // todo: XI
        return {
            kind: GrammarConstants_1.GrammarConstantsErrors.extraWordError,
            subkind: fullLine,
            level: index,
            context: context,
            message: `${GrammarConstants_1.GrammarConstantsErrors.extraWordError} "${word}" in "${fullLine}" at line ${line} word ${index}. Expected pattern: "${this._expectedLinePattern}".`
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
        const word = this._word;
        const index = this._index;
        const type = this.getCellTypeName();
        const fullLine = this._node.getLine();
        const line = this._getLineNumber();
        const context = fullLine.split(" ")[0]; // todo: XI
        const grammarProgram = this._grammarProgram;
        return {
            kind: GrammarConstants_1.GrammarConstantsErrors.grammarDefinitionError,
            subkind: type,
            level: index,
            context: context,
            message: `${GrammarConstants_1.GrammarConstantsErrors.grammarDefinitionError} No cellType "${type}" in grammar "${grammarProgram.getExtensionName()}" found in "${fullLine}" on line ${line}. Expected pattern: "${this._expectedLinePattern}".`
        };
    }
}
exports.GrammarUnknownCellTypeCell = GrammarUnknownCellTypeCell;
