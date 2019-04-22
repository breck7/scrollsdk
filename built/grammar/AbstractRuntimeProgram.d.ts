import TreeNode from "../base/TreeNode";
import AbstractRuntimeNode from "./AbstractRuntimeNode";
import types from "../types";
import GrammarProgram from "./GrammarProgram";
declare abstract class AbstractRuntimeProgram extends AbstractRuntimeNode {
    getProgramErrorsIterator(): IterableIterator<any>;
    getProgramErrors(): types.ParseError[];
    getInvalidKeywords(level?: any): string[];
    _getAllSuggestions(): string;
    getAutocompleteWordsAt(lineIndex: types.positiveInt, charIndex: types.positiveInt): {
        startCharIndex: number;
        endCharIndex: number;
        word: string;
        matches: {
            text: string;
            displayText: string;
        }[];
    };
    getProgramErrorMessages(): string[];
    getKeywordMap(): any;
    getDefinition(): GrammarProgram;
    getKeywordUsage(filepath?: string): TreeNode;
    getInPlaceSyntaxTree(): string;
    getInPlaceHighlightScopeTree(): string;
    getInPlaceSyntaxTreeWithNodeTypes(): string;
    protected _getSyntaxTreeHtml(): string;
    getTreeWithNodeTypes(): string;
    getWordTypeAtPosition(lineIndex: number, wordIndex: number): any;
    getWordHighlightScopeAtPosition(lineIndex: number, wordIndex: number): any;
    private _cache_programWordTypeStringMTime;
    private _cache_highlightScopeTree;
    private _cache_typeTree;
    protected _initWordTypeCache(): any;
    getCompiledProgramName(programPath: any): any;
}
export default AbstractRuntimeProgram;
