"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GrammarConstants_1 = require("./GrammarConstants");
/*
A cell contains a word but also the type information for that word.
*/
class GrammarBackedCell {
    constructor(word, type, node, index, expectedLinePattern, grammarProgram) {
        this._word = word;
        this._type = type;
        this._node = node;
        this._expectedLinePattern = expectedLinePattern;
        this._grammarProgram = grammarProgram;
        this._index = index + 1;
    }
    getType() {
        return (this._type && this._type.replace("*", "")) || undefined;
    }
    getWord() {
        return this._word;
    }
    getParsed() {
        return this._getWordTypeClass().parse(this._word);
    }
    isOptional() {
        return this._type && this._type.endsWith("*");
    }
    _getWordTypeClass() {
        return this._grammarProgram.getWordTypes()[this.getType()];
    }
    _getLineNumber() {
        return this._node.getPoint().y;
    }
    getErrorIfAny() {
        const word = this._word;
        if (word === undefined && this.isOptional())
            return undefined;
        const index = this._index;
        const type = this.getType();
        const fullLine = this._node.getLine();
        const line = this._getLineNumber();
        const context = fullLine.split(" ")[0]; // todo: XI
        if (word === undefined)
            return {
                kind: GrammarConstants_1.default.errors.unfilledColumnError,
                subkind: type,
                level: index,
                context: context,
                message: `${GrammarConstants_1.default.errors.unfilledColumnError} "${type}" column in "${fullLine}" at line ${line} column ${index}. Expected pattern: "${this._expectedLinePattern}". definition: ${this._node.getDefinition().toString()}`
            };
        if (type === undefined)
            return {
                kind: GrammarConstants_1.default.errors.extraWordError,
                subkind: fullLine,
                level: index,
                context: context,
                message: `${GrammarConstants_1.default.errors.extraWordError} "${word}" in "${fullLine}" at line ${line} column ${index}. Expected pattern: "${this._expectedLinePattern}".`
            };
        const grammarProgram = this._grammarProgram;
        const runTimeGrammarBackedProgram = this._node.getProgram();
        const wordTypeClass = this._getWordTypeClass();
        if (!wordTypeClass)
            return {
                kind: GrammarConstants_1.default.errors.grammarDefinitionError,
                subkind: type,
                level: index,
                context: context,
                message: `${GrammarConstants_1.default.errors.grammarDefinitionError} No column type "${type}" in grammar "${grammarProgram.getExtensionName()}" found in "${fullLine}" on line ${line}. Expected pattern: "${this._expectedLinePattern}".`
            };
        const isValid = wordTypeClass.isValid(this._word, runTimeGrammarBackedProgram);
        return isValid
            ? undefined
            : {
                kind: GrammarConstants_1.default.errors.invalidWordError,
                subkind: type,
                level: index,
                context: context,
                message: `${GrammarConstants_1.default.errors.invalidWordError} in "${fullLine}" at line ${line} column ${index}. "${word}" does not fit in "${type}" column. Expected pattern: "${this._expectedLinePattern}".`
            };
    }
}
exports.default = GrammarBackedCell;
