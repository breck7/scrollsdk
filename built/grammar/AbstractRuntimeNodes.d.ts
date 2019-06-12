import TreeNode from "../base/TreeNode";
import jTreeTypes from "../jTreeTypes";
import { AbstractGrammarBackedCell } from "./GrammarBackedCell";
import { UnknownNodeTypeError } from "./TreeErrorTypes";
import { AbstractGrammarDefinitionNode, GrammarNodeTypeDefinitionNode, GrammarProgram } from "./NodeDefinitionNodes";
import GrammarCompilerNode from "./GrammarCompilerNode";
declare abstract class AbstractRuntimeNode extends TreeNode {
    getGrammarProgram(): GrammarProgram;
    getNodeConstructor(line: string): Function;
    getFirstWordMap(): jTreeTypes.firstWordToNodeConstructorMap;
    getCatchAllNodeConstructor(line: string): Function;
    getProgram(): AbstractRuntimeNode;
    getAutocompleteResults(partialWord: string, cellIndex: jTreeTypes.positiveInt): {
        text: string;
        displayText: string;
    }[];
    protected _getGrammarBackedCellArray(): AbstractGrammarBackedCell<any>[];
    getRunTimeEnumOptions(cell: AbstractGrammarBackedCell<any>): string[];
    private _getAutocompleteResultsForCell;
    private _getAutocompleteResultsForFirstWord;
    abstract getDefinition(): AbstractGrammarDefinitionNode;
    protected _getNodeTypeDefinitionByFirstWordPath(path: string): AbstractGrammarDefinitionNode;
    protected _getRequiredNodeErrors(errors?: jTreeTypes.TreeError[]): jTreeTypes.TreeError[];
}
declare abstract class AbstractRuntimeNonRootNode extends AbstractRuntimeNode {
    getProgram(): AbstractRuntimeNode;
    getGrammarProgram(): GrammarProgram;
    getNodeTypeId(): jTreeTypes.nodeTypeId;
    getDefinition(): GrammarNodeTypeDefinitionNode;
    getConstantsObject(): jTreeTypes.stringMap;
    protected _getCompilerNode(targetLanguage: jTreeTypes.targetLanguageId): GrammarCompilerNode;
    protected _getCompiledIndentation(targetLanguage: jTreeTypes.targetLanguageId): string;
    protected _getCompiledLine(targetLanguage: jTreeTypes.targetLanguageId): string;
    compile(targetLanguage: jTreeTypes.targetLanguageId): string;
    getErrors(): jTreeTypes.TreeError[];
    getLineHints(): string;
    getParsedWords(): any[];
    readonly cells: jTreeTypes.stringMap;
    protected _getGrammarBackedCellArray(): AbstractGrammarBackedCell<any>[];
    getLineCellTypes(): string;
    getLineHighlightScopes(defaultScope?: string): string;
}
declare abstract class AbstractRuntimeProgramRootNode extends AbstractRuntimeNode {
    getProgramErrorsIterator(): IterableIterator<any>;
    getProgramErrors(): jTreeTypes.TreeError[];
    getInvalidNodeTypes(): any[];
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
}
declare class GrammarBackedTerminalNode extends AbstractRuntimeNonRootNode {
}
declare class GrammarBackedErrorNode extends AbstractRuntimeNonRootNode {
    getLineCellTypes(): string;
    getErrors(): UnknownNodeTypeError[];
}
declare class GrammarBackedNonTerminalNode extends AbstractRuntimeNonRootNode {
    protected _getNodeJoinCharacter(): string;
    compile(targetExtension: jTreeTypes.targetLanguageId): string;
    private static _backupConstructorEnabled;
    static useAsBackupConstructor(): boolean;
    static setAsBackupConstructor(value: boolean): typeof GrammarBackedNonTerminalNode;
}
declare class GrammarBackedBlobNode extends GrammarBackedNonTerminalNode {
    getFirstWordMap(): {};
    getErrors(): jTreeTypes.TreeError[];
    getCatchAllNodeConstructor(line: string): typeof GrammarBackedBlobNode;
}
export { AbstractRuntimeNode, AbstractRuntimeProgramRootNode, AbstractRuntimeNonRootNode, GrammarBackedTerminalNode, GrammarBackedErrorNode, GrammarBackedNonTerminalNode, GrammarBackedBlobNode };
