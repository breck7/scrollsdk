import TreeNode from "../base/TreeNode";
import AbstractRuntimeNode from "./AbstractRuntimeNode";
import types from "../types";
declare abstract class AbstractRuntimeProgram extends AbstractRuntimeNode {
    getProgramErrorsIterator(): IterableIterator<any>;
    getProgramErrors(): types.ParseError[];
    getInvalidKeywords(level?: any): string[];
    getProgramErrorMessages(): string[];
    getKeywordMap(): any;
    getCatchAllNodeConstructor(line: any): any;
    getDefinition(): any;
    getKeywordUsage(filepath?: string): TreeNode;
    getInPlaceSyntaxTree(): string;
    getInPlaceSyntaxTreeWithNodeTypes(): string;
    protected _getSyntaxTreeHtml(): string;
    getTreeWithNodeTypes(): string;
    private _cache_typeTree;
    getWordTypeAtPosition(lineIndex: any, wordIndex: any): any;
    private _cache_programWordTypeStringMTime;
    protected _initWordTypeCache(): any;
    getCompiledProgramName(programPath: any): any;
}
export default AbstractRuntimeProgram;
