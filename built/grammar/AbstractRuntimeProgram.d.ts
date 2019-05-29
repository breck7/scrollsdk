import TreeNode from "../base/TreeNode";
import AbstractRuntimeNode from "./AbstractRuntimeNode";
import jTreeTypes from "../jTreeTypes";
import GrammarProgram from "./GrammarProgram";
declare abstract class AbstractRuntimeProgram extends AbstractRuntimeNode {
    getProgramErrorsIterator(): IterableIterator<any>;
    getProgramErrors(): jTreeTypes.ParseError[];
    getInvalidNodeTypes(level?: jTreeTypes.int): string[];
    updateNodeTypeIds(nodeTypeMap: TreeNode | string | jTreeTypes.nodeIdRenameMap): this;
    getAllSuggestions(): string;
    getAutocompleteResultsAt(lineIndex: jTreeTypes.positiveInt, charIndex: jTreeTypes.positiveInt): {
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
    getFirstWordMap(): jTreeTypes.firstWordToNodeConstructorMap;
    getDefinition(): GrammarProgram;
    getNodeTypeUsage(filepath?: string): TreeNode;
    getInPlaceCellTypeTree(): string;
    getInPlaceHighlightScopeTree(): string;
    getInPlaceCellTypeTreeWithNodeConstructorNames(): string;
    protected _getInPlaceCellTypeTreeHtml(): string;
    getTreeWithNodeTypes(): string;
    getCellHighlightScopeAtPosition(lineIndex: number, wordIndex: number): jTreeTypes.highlightScope | undefined;
    private _cache_programCellTypeStringMTime;
    private _cache_highlightScopeTree;
    private _cache_typeTree;
    protected _initCellTypeCache(): void;
    getCompiledProgramName(programPath: string): string;
}
export default AbstractRuntimeProgram;
