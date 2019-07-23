import TreeNode from "./base/TreeNode";
import jTreeTypes from "./jTreeTypes";
interface AbstractRuntimeProgramConstructorInterface {
    new (code: string): GrammarBackedRootNode;
}
declare enum GrammarStandardCellTypeIds {
    any = "any",
    anyFirstCell = "anyFirstCell",
    extraWord = "extraWord",
    float = "float",
    number = "number",
    bit = "bit",
    bool = "bool",
    int = "int"
}
declare enum GrammarConstants {
    extensions = "extensions",
    toolingDirective = "tooling",
    todoComment = "todo",
    version = "version",
    nodeTypeOrder = "nodeTypeOrder",
    nodeType = "nodeType",
    cellType = "cellType",
    regex = "regex",
    reservedWords = "reservedWords",
    enumFromGrammar = "enumFromGrammar",
    enum = "enum",
    baseNodeType = "baseNodeType",
    blobNode = "blobNode",
    errorNode = "errorNode",
    extends = "extends",
    abstract = "abstract",
    root = "root",
    match = "match",
    inScope = "inScope",
    cells = "cells",
    catchAllCellType = "catchAllCellType",
    firstCellType = "firstCellType",
    catchAllNodeType = "catchAllNodeType",
    constants = "constants",
    required = "required",
    single = "single",
    tags = "tags",
    GrammarBackedBlobNode = "GrammarBackedBlobNode",
    defaultRootNodeTypeId = "defaultRootNodeTypeId",
    javascript = "javascript",
    compilerNodeType = "compiler",
    compilesTo = "compilesTo",
    description = "description",
    example = "example",
    frequency = "frequency",
    highlightScope = "highlightScope"
}
declare abstract class GrammarBackedNode extends TreeNode {
    abstract getDefinition(): AbstractGrammarDefinitionNode;
    getAutocompleteResults(partialWord: string, cellIndex: jTreeTypes.positiveInt): {
        text: string;
        displayText: string;
    }[];
    getChildInstancesOfNodeTypeId(nodeTypeId: jTreeTypes.nodeTypeId): GrammarBackedNode[];
    getCatchAllNodeConstructor(line: string): Function;
    doesExtend(nodeTypeId: jTreeTypes.nodeTypeId): boolean;
    _getErrorNodeErrors(): UnknownNodeTypeError[];
    _getBlobNodeCatchAllNodeType(): typeof GrammarBackedBlobNode;
    private _getAutocompleteResultsForFirstWord;
    private _getAutocompleteResultsForCell;
    abstract getGrammarProgramRoot(): GrammarProgram;
    abstract getRootProgramNode(): GrammarBackedRootNode;
    protected _getGrammarBackedCellArray(): AbstractGrammarBackedCell<any>[];
    getRunTimeEnumOptions(cell: AbstractGrammarBackedCell<any>): string[];
    protected _getRequiredNodeErrors(errors?: jTreeTypes.TreeError[]): jTreeTypes.TreeError[];
}
declare class TypedWord {
    private _node;
    private _cellIndex;
    private _type;
    constructor(node: TreeNode, cellIndex: number, type: string);
    replace(newWord: string): void;
    readonly word: string;
    readonly type: string;
}
declare abstract class GrammarBackedRootNode extends GrammarBackedNode {
    getRootProgramNode(): this;
    getAllTypedWords(): TypedWord[];
    getDefinition(): GrammarProgram;
    getInPlaceCellTypeTree(): string;
    getParseTable(maxColumnWidth?: number): string;
    getErrors(): jTreeTypes.TreeError[];
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
    getNodeTypeUsage(filepath?: string): TreeNode;
    getInPlaceHighlightScopeTree(): string;
    getCatchAllNodeConstructor(line: string): typeof GrammarBackedBlobNode;
    getInPlaceCellTypeTreeWithNodeConstructorNames(): string;
    getTreeWithNodeTypes(): string;
    getCellHighlightScopeAtPosition(lineIndex: number, wordIndex: number): jTreeTypes.highlightScope | undefined;
    private _cache_programCellTypeStringMTime;
    private _cache_highlightScopeTree;
    private _cache_typeTree;
    protected _initCellTypeCache(): void;
}
declare abstract class GrammarBackedNonRootNode extends GrammarBackedNode {
    getRootProgramNode(): GrammarBackedRootNode;
    getNodeTypeId(): jTreeTypes.nodeTypeId;
    getDefinition(): NonRootNodeTypeDefinition;
    getGrammarProgramRoot(): GrammarProgram;
    getWordTypes(): AbstractGrammarBackedCell<any>[];
    protected _getGrammarBackedCellArray(): AbstractGrammarBackedCell<any>[];
    getLineCellTypes(): string;
    getLineHighlightScopes(defaultScope?: string): string;
    getErrors(): jTreeTypes.TreeError[];
    protected _getCompiledIndentation(): any;
    protected _getCompiledLine(): string;
    compile(): string;
    readonly cells: jTreeTypes.stringMap;
}
declare class GrammarBackedBlobNode extends GrammarBackedNonRootNode {
    getFirstWordMap(): {};
    getErrors(): jTreeTypes.TreeError[];
    getCatchAllNodeConstructor(line: string): typeof GrammarBackedBlobNode;
}
declare abstract class AbstractGrammarBackedCell<T> {
    constructor(node: GrammarBackedNonRootNode, index: jTreeTypes.int, typeDef: GrammarCellTypeDefinitionNode, cellTypeId: string, isCatchAll: boolean);
    private _node;
    protected _index: jTreeTypes.int;
    protected _word: string;
    private _typeDef;
    private _isCatchAll;
    private _cellTypeId;
    getCellTypeId(): string;
    static parserFunctionName: string;
    getNode(): GrammarBackedNonRootNode;
    getCellIndex(): number;
    isCatchAll(): boolean;
    abstract getParsed(): T;
    getHighlightScope(): string | undefined;
    getAutoCompleteWords(partialWord?: string): {
        text: string;
        displayText: string;
    }[];
    getWord(): string;
    protected _getCellTypeDefinition(): GrammarCellTypeDefinitionNode;
    protected _getFullLine(): string;
    protected _getErrorContext(): string;
    protected abstract _isValid(): boolean;
    isValid(): boolean;
    getErrorIfAny(): jTreeTypes.TreeError;
}
declare abstract class AbstractTreeError implements jTreeTypes.TreeError {
    constructor(node: GrammarBackedNode);
    private _node;
    getLineIndex(): jTreeTypes.positiveInt;
    getLineNumber(): jTreeTypes.positiveInt;
    isCursorOnWord(lineIndex: jTreeTypes.positiveInt, characterIndex: jTreeTypes.positiveInt): boolean;
    private _doesCharacterIndexFallOnWord;
    isBlankLineError(): boolean;
    isMissingWordError(): boolean;
    getIndent(): string;
    getCodeMirrorLineWidgetElement(onApplySuggestionCallBack?: () => void): HTMLDivElement;
    private _getCodeMirrorLineWidgetElementCellTypeHints;
    private _getCodeMirrorLineWidgetElementWithoutSuggestion;
    private _getCodeMirrorLineWidgetElementWithSuggestion;
    getLine(): string;
    getExtension(): string;
    getNode(): GrammarBackedNode;
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
    toString(): string;
    applySuggestion(): void;
    getMessage(): string;
}
declare class UnknownNodeTypeError extends AbstractTreeError {
    getMessage(): string;
    protected _getWordSuggestion(): string;
    getSuggestionMessage(): string;
    applySuggestion(): this;
}
declare abstract class AbstractExtendibleTreeNode extends TreeNode {
    _getFromExtended(firstWordPath: jTreeTypes.firstWordPath): string;
    _getChildrenByNodeConstructorInExtended(constructor: Function): TreeNode[];
    _getExtendedParent(): AbstractExtendibleTreeNode;
    _hasFromExtended(firstWordPath: jTreeTypes.firstWordPath): boolean;
    _getNodeFromExtended(firstWordPath: jTreeTypes.firstWordPath): AbstractExtendibleTreeNode;
    _doesExtend(nodeTypeId: jTreeTypes.nodeTypeId): boolean;
    _getAncestorSet(): Set<string>;
    _getId(): string;
    private _cache_ancestorSet;
    private _cache_ancestorsArray;
    _getAncestorsArray(cannotContainNodes?: AbstractExtendibleTreeNode[]): AbstractExtendibleTreeNode[];
    private _getIdThatThisExtends;
    abstract _getIdToNodeMap(): {
        [id: string]: AbstractExtendibleTreeNode;
    };
    protected _initAncestorsArrayCache(cannotContainNodes?: AbstractExtendibleTreeNode[]): void;
}
declare class GrammarCellTypeDefinitionNode extends AbstractExtendibleTreeNode {
    getFirstWordMap(): jTreeTypes.stringMap;
    _getIdToNodeMap(): {
        [name: string]: GrammarCellTypeDefinitionNode;
    };
    getGetter(wordIndex: number): string;
    getCatchAllGetter(wordIndex: number): string;
    getCellConstructor(): typeof AbstractGrammarBackedCell;
    private _getExtendedCellTypeId;
    getHighlightScope(): string | undefined;
    private _getEnumOptions;
    private _getEnumFromGrammarOptions;
    _getRootProgramNode(): GrammarProgram;
    _getAutocompleteWordOptions(program: GrammarBackedRootNode): string[];
    getRegexString(): string;
    isValid(str: string, programRootNode: GrammarBackedRootNode): boolean;
    getCellTypeId(): jTreeTypes.cellTypeId;
    static types: any;
}
declare class GrammarExampleNode extends TreeNode {
}
declare abstract class GrammarNodeTypeConstant extends TreeNode {
    getGetter(): string;
    getIdentifier(): string;
    getConstantValueAsJsText(): string;
    getConstantValue(): any;
}
declare abstract class AbstractGrammarDefinitionNode extends AbstractExtendibleTreeNode {
    getFirstWordMap(): jTreeTypes.firstWordToNodeConstructorMap;
    getConstantsObject(): {
        [key: string]: GrammarNodeTypeConstant;
    };
    _getUniqueConstantNodes(extended?: boolean): {
        [key: string]: GrammarNodeTypeConstant;
    };
    getExamples(): GrammarExampleNode[];
    getNodeTypeIdFromDefinition(): jTreeTypes.nodeTypeId;
    _getGeneratedClassName(): string;
    _hasValidNodeTypeId(): boolean;
    _isAbstract(): boolean;
    private _cache_definedNodeConstructor;
    _getConstructorDefinedInGrammar(): Function;
    _getFirstWordMatch(): string;
    getLanguageDefinitionProgram(): GrammarProgram;
    protected _getCustomJavascriptMethods(): jTreeTypes.javascriptCode;
    private _cache_firstWordToNodeDefMap;
    getFirstWordMapWithDefinitions(): {
        [firstWord: string]: NonRootNodeTypeDefinition;
    };
    getRunTimeFirstWordsInScope(): jTreeTypes.nodeTypeId[];
    getRequiredCellTypeIds(): jTreeTypes.cellTypeId[];
    _getCellGettersAndNodeTypeConstants(): string;
    getCatchAllCellTypeId(): jTreeTypes.cellTypeId | undefined;
    protected _createFirstWordToNodeDefMap(nodeTypeIdsInScope: jTreeTypes.nodeTypeId[]): {
        [firstWord: string]: NonRootNodeTypeDefinition;
    };
    getTopNodeTypeIds(): jTreeTypes.nodeTypeId[];
    protected _getMyInScopeNodeTypeIds(): jTreeTypes.nodeTypeId[];
    protected _getInScopeNodeTypeIds(): jTreeTypes.nodeTypeId[];
    isRequired(): boolean;
    getNodeTypeDefinitionByNodeTypeId(nodeTypeId: jTreeTypes.nodeTypeId): AbstractGrammarDefinitionNode;
    getFirstCellTypeId(): jTreeTypes.cellTypeId;
    isDefined(nodeTypeId: string): boolean;
    _getIdToNodeMap(): {
        [nodeTypeId: string]: NonRootNodeTypeDefinition;
    };
    private _cache_isRoot;
    private _amIRoot;
    private _getLanguageRootNode;
    private _isErrorNodeType;
    private _isBlobNodeType;
    private _getErrorMethodToJavascript;
    private _getParserToJavascript;
    private _getCatchAllNodeConstructorToJavascript;
    _nodeDefToJavascriptClass(): jTreeTypes.javascriptCode;
    _getCompilerObject(): jTreeTypes.stringMap;
    getLineHints(): string;
    isOrExtendsANodeTypeInScope(firstWordsInScope: string[]): boolean;
    isTerminalNodeType(): boolean;
    private _getFirstCellHighlightScope;
    getMatchBlock(): string;
    private _cache_nodeTypeInheritanceSet;
    private _cache_ancestorNodeTypeIdsArray;
    _getNodeTypeInheritanceSet(): Set<string>;
    getAncestorNodeTypeIdsArray(): jTreeTypes.nodeTypeId[];
    protected _getProgramNodeTypeDefinitionCache(): {
        [nodeTypeId: string]: NonRootNodeTypeDefinition;
    };
    getDescription(): string;
    getFrequency(): number;
    private _getExtendedNodeTypeId;
}
declare class NonRootNodeTypeDefinition extends AbstractGrammarDefinitionNode {
}
declare class GrammarProgram extends AbstractGrammarDefinitionNode {
    getFirstWordMap(): jTreeTypes.stringMap;
    private _cache_compiledLoadedNodeTypes;
    _getCompiledLoadedNodeTypes(): {
        [nodeTypeId: string]: Function;
    };
    private _importNodeJsRootNodeTypeConstructor;
    private _importBrowserRootNodeTypeConstructor;
    getErrorsInGrammarExamples(): jTreeTypes.TreeError[];
    getTargetExtension(): string;
    getNodeTypeOrder(): string;
    private _cache_cellTypes;
    getCellTypeDefinitions(): {
        [name: string]: GrammarCellTypeDefinitionNode;
    };
    getCellTypeDefinitionById(cellTypeId: jTreeTypes.cellTypeId): GrammarCellTypeDefinitionNode;
    getNodeTypeFamilyTree(): TreeNode;
    protected _getCellTypeDefinitions(): {
        [typeName: string]: GrammarCellTypeDefinitionNode;
    };
    getLanguageDefinitionProgram(): this;
    getValidConcreteAndAbstractNodeTypeDefinitions(): NonRootNodeTypeDefinition[];
    private _cache_rootNodeTypeNode;
    _getRootNodeTypeDefinitionNode(): NonRootNodeTypeDefinition;
    _addDefaultCatchAllBlobNode(): void;
    getExtensionName(): string;
    getGrammarName(): string | undefined;
    protected _getMyInScopeNodeTypeIds(): jTreeTypes.nodeTypeId[];
    protected _getInScopeNodeTypeIds(): jTreeTypes.nodeTypeId[];
    private _cache_nodeTypeDefinitions;
    protected _initProgramNodeTypeDefinitionCache(): void;
    _getProgramNodeTypeDefinitionCache(): {
        [nodeTypeId: string]: NonRootNodeTypeDefinition;
    };
    static _languages: any;
    static _nodeTypes: any;
    private _getRootConstructor;
    private _cache_rootConstructorClass;
    getRootConstructor(): AbstractRuntimeProgramConstructorInterface;
    private _getFileExtensions;
    toNodeJsJavascript(jtreePath?: string): jTreeTypes.javascriptCode;
    toBrowserJavascript(): jTreeTypes.javascriptCode;
    private _getProperName;
    private _rootNodeDefToJavascriptClass;
    toSublimeSyntaxFile(): string;
}
export { GrammarConstants, GrammarStandardCellTypeIds, GrammarProgram, GrammarBackedRootNode, GrammarBackedNonRootNode };
