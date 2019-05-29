import jTreeTypes from "../jTreeTypes";
import TreeNode from "../base/TreeNode";
import AbstractRuntimeNode from "./AbstractRuntimeNode";
import { AbstractGrammarBackedCell } from "./GrammarBackedCell";
declare abstract class AbstractTreeError implements jTreeTypes.TreeError {
    constructor(node: AbstractRuntimeNode | TreeNode);
    private _node;
    getLineIndex(): jTreeTypes.positiveInt;
    getLineNumber(): jTreeTypes.positiveInt;
    isBlankLineError(): boolean;
    getLine(): string;
    getExtension(): string;
    getNode(): TreeNode | AbstractRuntimeNode;
    getErrorTypeName(): string;
    getCellIndex(): number;
    toObject(): {
        type: string;
        line: number;
        cell: number;
        suggestion: string;
        path: string;
        message: string;
    };
    hasSuggestion(): boolean;
    getSuggestionMessage(): string;
    applySuggestion(): void;
    getMessage(): string;
}
declare abstract class AbstractCellError extends AbstractTreeError {
    constructor(cell: AbstractGrammarBackedCell<any>);
    getCell(): AbstractGrammarBackedCell<any>;
    getCellIndex(): number;
    protected _getWordSuggestion(): string;
    private _cell;
}
declare abstract class FirstWordError extends AbstractTreeError {
}
declare class UnknownNodeTypeError extends FirstWordError {
    getMessage(): string;
    protected _getWordSuggestion(): string;
    getSuggestionMessage(): string;
    applySuggestion(): this;
}
declare class BlankLineError extends UnknownNodeTypeError {
    getMessage(): string;
    isBlankLineError(): boolean;
    getSuggestionMessage(): string;
    applySuggestion(): this;
}
declare class InvalidConstructorPathError extends AbstractTreeError {
    getMessage(): string;
}
declare class MissingRequiredNodeTypeError extends AbstractTreeError {
    constructor(node: AbstractRuntimeNode | TreeNode, missingWord: jTreeTypes.firstWord);
    getMessage(): string;
    getSuggestionMessage(): string;
    applySuggestion(): any;
    private _missingWord;
}
declare class NodeTypeUsedMultipleTimesError extends AbstractTreeError {
    getMessage(): string;
    getSuggestionMessage(): string;
    applySuggestion(): void;
}
declare class UnknownCellTypeError extends AbstractCellError {
    getMessage(): string;
}
declare class InvalidWordError extends AbstractCellError {
    getMessage(): string;
    getSuggestionMessage(): string;
    applySuggestion(): this;
}
declare class ExtraWordError extends AbstractCellError {
    getMessage(): string;
    getSuggestionMessage(): string;
    applySuggestion(): TreeNode;
}
declare class MissingWordError extends AbstractCellError {
    getMessage(): string;
}
export { UnknownNodeTypeError, BlankLineError, InvalidConstructorPathError, InvalidWordError, UnknownCellTypeError, ExtraWordError, MissingWordError, MissingRequiredNodeTypeError, NodeTypeUsedMultipleTimesError };
