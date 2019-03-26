import types from "../types";
declare class GrammarBackedCell {
    constructor(word: string, type: string, node: any, index: types.int, expectedLinePattern: string, grammarProgram: any);
    private _node;
    private _grammarProgram;
    private _expectedLinePattern;
    private _index;
    private _word;
    private _type;
    getType(): string;
    getWord(): string;
    getParsed(): any;
    isOptional(): boolean;
    protected _getWordTypeClass(): any;
    protected _getLineNumber(): any;
    getErrorIfAny(): types.ParseError;
}
export default GrammarBackedCell;
