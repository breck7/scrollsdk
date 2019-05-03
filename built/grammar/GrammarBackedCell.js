"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GrammarConstants_1 = require("./GrammarConstants");
/*
A cell contains a word but also the type information for that word.
*/
class GrammarBackedCell {
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
    getType() {
        return this._type || undefined;
    }
    isCatchAll() {
        return this._isCatchAll;
    }
    getHighlightScope() {
        const typeClass = this._getCellTypeClass();
        if (typeClass)
            return typeClass.getHighlightScope();
    }
    getAutoCompleteWords(partialWord) {
        const typeClass = this._getCellTypeClass();
        let words = typeClass ? typeClass.getAutocompleteWordOptions(this._program) : [];
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
    getParsed() {
        return this._getCellTypeClass().parse(this._word);
    }
    _getCellTypeClass() {
        return this._grammarProgram.getCellTypes()[this.getType()];
    }
    _getLineNumber() {
        return this._node.getPoint().y;
    }
    getErrorIfAny() {
        const word = this._word;
        const index = this._index;
        const type = this.getType();
        const fullLine = this._node.getLine();
        const line = this._getLineNumber();
        const context = fullLine.split(" ")[0]; // todo: XI
        if (word === undefined)
            return {
                kind: GrammarConstants_1.GrammarConstantsErrors.unfilledColumnError,
                subkind: type,
                level: index,
                context: context,
                message: `${GrammarConstants_1.GrammarConstantsErrors.unfilledColumnError} "${type}" column in "${fullLine}" at line ${line} column ${index}. Expected pattern: "${this._expectedLinePattern}". definition: ${this._node.getDefinition().toString()}`
            };
        if (type === undefined)
            return {
                kind: GrammarConstants_1.GrammarConstantsErrors.extraWordError,
                subkind: fullLine,
                level: index,
                context: context,
                message: `${GrammarConstants_1.GrammarConstantsErrors.extraWordError} "${word}" in "${fullLine}" at line ${line} column ${index}. Expected pattern: "${this._expectedLinePattern}".`
            };
        const grammarProgram = this._grammarProgram;
        const runTimeGrammarBackedProgram = this._node.getProgram();
        const typeClass = this._getCellTypeClass();
        if (!typeClass)
            return {
                kind: GrammarConstants_1.GrammarConstantsErrors.grammarDefinitionError,
                subkind: type,
                level: index,
                context: context,
                message: `${GrammarConstants_1.GrammarConstantsErrors.grammarDefinitionError} No column type "${type}" in grammar "${grammarProgram.getExtensionName()}" found in "${fullLine}" on line ${line}. Expected pattern: "${this._expectedLinePattern}".`
            };
        return typeClass.isValid(this._word, runTimeGrammarBackedProgram)
            ? undefined
            : {
                kind: GrammarConstants_1.GrammarConstantsErrors.invalidWordError,
                subkind: type,
                level: index,
                context: context,
                message: `${GrammarConstants_1.GrammarConstantsErrors.invalidWordError} in "${fullLine}" at line ${line} column ${index}. "${word}" does not fit in "${type}" column. Expected pattern: "${this._expectedLinePattern}".`
            };
    }
}
exports.default = GrammarBackedCell;
