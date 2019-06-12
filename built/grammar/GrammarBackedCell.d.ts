import jTreeTypes from "../jTreeTypes";
import { AbstractRuntimeNonRootNode } from "./AbstractRuntimeNodes";
import GrammarCellTypeDefinitionNode from "./GrammarCellTypeDefinitionNode";
declare abstract class AbstractGrammarBackedCell<T> {
    constructor(node: AbstractRuntimeNonRootNode, index: jTreeTypes.int, typeDef: GrammarCellTypeDefinitionNode, cellTypeId: string, isCatchAll: boolean);
    private _node;
    protected _index: jTreeTypes.int;
    protected _word: string;
    private _typeDef;
    private _isCatchAll;
    private _cellTypeId;
    getCellTypeId(): string;
    getNode(): any;
    getCellIndex(): number;
    private _getProgram;
    isCatchAll(): boolean;
    abstract getParsed(): T;
    getHighlightScope(): string | undefined;
    getAutoCompleteWords(partialWord?: string): {
        text: string;
        displayText: string;
    }[];
    getWord(): string;
    protected _getCellTypeDefinition(): GrammarCellTypeDefinitionNode;
    protected _getLineNumber(): any;
    protected _getFullLine(): any;
    protected _getErrorContext(): any;
    protected abstract _isValid(): boolean;
    isValid(): boolean;
    getErrorIfAny(): jTreeTypes.TreeError;
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
    getErrorIfAny(): jTreeTypes.TreeError;
}
declare class GrammarUnknownCellTypeCell extends AbstractGrammarBackedCell<string> {
    _isValid(): boolean;
    getParsed(): string;
    getErrorIfAny(): jTreeTypes.TreeError;
}
export { AbstractGrammarBackedCell, GrammarIntCell, GrammarBitCell, GrammarFloatCell, GrammarBoolCell, GrammarAnyCell, GrammarUnknownCellTypeCell, GrammarExtraWordCellTypeCell };
