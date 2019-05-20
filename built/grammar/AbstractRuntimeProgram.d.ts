import TreeNode from "../base/TreeNode";
import AbstractRuntimeNode from "./AbstractRuntimeNode";
import types from "../types";
import GrammarProgram from "./GrammarProgram";
declare abstract class AbstractRuntimeProgram extends AbstractRuntimeNode {
    getProgramErrorsIterator(): IterableIterator<any>;
    getProgramErrors(): types.ParseError[];
    getInvalidNodeTypes(level?: types.int): string[];
    getAllSuggestions(): string;
    getAutocompleteResultsAt(lineIndex: types.positiveInt, charIndex: types.positiveInt): {
        startCharIndex: number;
        endCharIndex: number;
        word: string;
        matches: {
            text: string;
            displayText: string;
        }[];
    };
    getPrettified(): string;
    getProgramErrorMessages(): string[];
    getFirstWordMap(): types.firstWordToNodeConstructorMap;
    getDefinition(): GrammarProgram;
    getNodeTypeUsage(filepath?: string): TreeNode;
    getInPlaceCellTypeTree(): string;
    getInPlaceHighlightScopeTree(): string;
    getInPlaceCellTypeTreeWithNodeConstructorNames(): string;
    protected _getInPlaceCellTypeTreeHtml(): string;
    getTreeWithNodeTypes(): string;
    getCellHighlightScopeAtPosition(lineIndex: number, wordIndex: number): types.highlightScope | undefined;
    private _cache_programCellTypeStringMTime;
    private _cache_highlightScopeTree;
    private _cache_typeTree;
    protected _initCellTypeCache(): void;
    getCompiledProgramName(programPath: string): string;
}
export default AbstractRuntimeProgram;
