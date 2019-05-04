import types from "../types";
import GrammarProgram from "./GrammarProgram";
import AbstractRuntimeProgram from "./AbstractRuntimeProgram";
import GrammarCellTypeDefinitionNode from "./GrammarCellTypeDefinitionNode";
declare abstract class AbstractGrammarBackedCell<T> {
    constructor(word: string, type: GrammarCellTypeDefinitionNode, node: any, index: types.int, isCatchAll: boolean, expectedLinePattern: string, grammarProgram: GrammarProgram, runTimeProgram: AbstractRuntimeProgram);
    protected _node: any;
    protected _grammarProgram: GrammarProgram;
    protected _program: AbstractRuntimeProgram;
    protected _expectedLinePattern: string;
    protected _index: types.int;
    protected _word: string;
    protected _type: GrammarCellTypeDefinitionNode;
    protected _isCatchAll: boolean;
    getCellTypeName(): string;
    isCatchAll(): boolean;
    abstract getParsed(): T;
    getHighlightScope(): string | undefined;
    getAutoCompleteWords(partialWord: string): {
        text: string;
        displayText: string;
    }[];
    getWord(): string;
    protected _getCellTypeDefinition(): GrammarCellTypeDefinitionNode;
    protected _getLineNumber(): any;
    protected abstract _isValid(): boolean;
    isValid(): boolean;
    getErrorIfAny(): types.ParseError;
}
declare class GrammarIntCell extends AbstractGrammarBackedCell<number> {
    _isValid(): boolean;
    getRegexString(): string;
    getParsed(): number;
}
declare class GrammarBitCell extends AbstractGrammarBackedCell<boolean> {
    _isValid(): boolean;
    getRegexString(): string;
    getParsed(): boolean;
}
declare class GrammarFloatCell extends AbstractGrammarBackedCell<number> {
    _isValid(): boolean;
    getRegexString(): string;
    getParsed(): number;
}
declare class GrammarBoolCell extends AbstractGrammarBackedCell<boolean> {
    private _trues;
    private _falses;
    _isValid(): boolean;
    private _getOptions;
    getRegexString(): string;
    getParsed(): boolean;
}
declare class GrammarAnyCell extends AbstractGrammarBackedCell<string> {
    _isValid(): boolean;
    getRegexString(): string;
    getParsed(): string;
}
declare class GrammarExtraWordCellTypeCell extends AbstractGrammarBackedCell<string> {
    _isValid(): boolean;
    getParsed(): string;
    getErrorIfAny(): types.ParseError;
}
declare class GrammarUnknownCellTypeCell extends AbstractGrammarBackedCell<string> {
    _isValid(): boolean;
    getParsed(): string;
    getErrorIfAny(): types.ParseError;
}
export { AbstractGrammarBackedCell, GrammarIntCell, GrammarBitCell, GrammarFloatCell, GrammarBoolCell, GrammarAnyCell, GrammarUnknownCellTypeCell, GrammarExtraWordCellTypeCell };
