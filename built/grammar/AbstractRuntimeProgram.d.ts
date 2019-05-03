import TreeNode from "../base/TreeNode";
import AbstractRuntimeNode from "./AbstractRuntimeNode";
import types from "../types";
import GrammarProgram from "./GrammarProgram";
declare abstract class AbstractRuntimeProgram extends AbstractRuntimeNode {
    getProgramErrorsIterator(): IterableIterator<any>;
    getProgramErrors(): types.ParseError[];
    getInvalidKeywords(level?: any): string[];
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
    getPrettified(): any;
    getProgramErrorMessages(): string[];
    getKeywordMap(): any;
    getDefinition(): GrammarProgram;
    getKeywordUsage(filepath?: string): TreeNode;
    getInPlaceSyntaxTree(): string;
    getInPlaceHighlightScopeTree(): string;
    getInPlaceSyntaxTreeWithNodeTypes(): string;
    protected _getSyntaxTreeHtml(): string;
    getTreeWithNodeTypes(): string;
    getCellTypeAtPosition(lineIndex: number, wordIndex: number): any;
    getWordHighlightScopeAtPosition(lineIndex: number, wordIndex: number): types.highlightScope | undefined;
    private _cache_programCellTypeStringMTime;
    private _cache_highlightScopeTree;
    private _cache_typeTree;
    protected _initCellTypeCache(): any;
    getCompiledProgramName(programPath: any): any;
}
export default AbstractRuntimeProgram;
