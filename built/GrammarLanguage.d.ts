import TreeNode from "./base/TreeNode";
import jTreeTypes from "./jTreeTypes";
interface AbstractRuntimeProgramConstructorInterface {
    new (code: string): GrammarBackedRootNode;
}
declare enum GrammarStandardCellTypeIds {
    any = "any",
    anyFirstWord = "anyFirstWord",
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
    terminalNode = "terminalNode",
    nonTerminalNode = "nonTerminalNode",
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
    doesExtend(nodeTypeId: jTreeTypes.nodeTypeId): boolean;
    private _getAutocompleteResultsForFirstWord;
    private _getAutocompleteResultsForCell;
    abstract getGrammarProgramRoot(): GrammarProgram;
    getFirstWordMap(): jTreeTypes.firstWordToNodeConstructorMap;
    getCatchAllNodeConstructor(line: string): Function;
    abstract getRootProgramNode(): GrammarBackedRootNode;
    protected _getGrammarBackedCellArray(): AbstractGrammarBackedCell<any>[];
    getRunTimeEnumOptions(cell: AbstractGrammarBackedCell<any>): string[];
    protected _getRequiredNodeErrors(errors?: jTreeTypes.TreeError[]): jTreeTypes.TreeError[];
}
declare abstract class GrammarBackedRootNode extends GrammarBackedNode {
    getRootProgramNode(): this;
    getDefinition(): GrammarProgram;
    getInPlaceCellTypeTree(): string;
    getAllErrors(): jTreeTypes.TreeError[];
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
    protected _getGrammarBackedCellArray(): AbstractGrammarBackedCell<any>[];
    getLineCellTypes(): string;
    getLineHighlightScopes(defaultScope?: string): string;
    getErrors(): jTreeTypes.TreeError[];
    protected _getCompiledIndentation(): any;
    protected _getCompiledLine(): string;
    compile(): string;
    readonly cells: jTreeTypes.stringMap;
}
declare class GrammarBackedTerminalNode extends GrammarBackedNonRootNode {
}
declare class GrammarBackedErrorNode extends GrammarBackedNonRootNode {
    getLineCellTypes(): string;
    getErrors(): UnknownNodeTypeError[];
}
declare class GrammarBackedNonTerminalNode extends GrammarBackedNonRootNode {
    protected _getChildJoinCharacter(): string;
    compile(): string;
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
    protected _getLineNumber(): number;
    protected _getFullLine(): string;
    protected _getErrorContext(): string;
    protected abstract _isValid(): boolean;
    isValid(): boolean;
    getErrorIfAny(): jTreeTypes.TreeError;
}
declare abstract class AbstractTreeError implements jTreeTypes.TreeError {
    constructor(node: GrammarBackedNode | TreeNode);
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
    getNode(): TreeNode | GrammarBackedNode;
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
    abstract _getId(): string;
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
    _getId(): string;
    static types: any;
}
declare class GrammarDefinitionErrorNode extends TreeNode {
    getErrors(): jTreeTypes.TreeError[];
    getLineCellTypes(): string;
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
    abstract _getExtendsClassName(isCompiled?: boolean): string;
    _getUniqueConstantNodes(): {
        [key: string]: GrammarNodeTypeConstant;
    };
    getExamples(): GrammarExampleNode[];
    getNodeTypeIdFromDefinition(): jTreeTypes.nodeTypeId;
    abstract _nodeDefToJavascriptClass(isCompiled: boolean, jTreePath?: string, forNodeJs?: boolean): jTreeTypes.javascriptCode;
    _getGeneratedClassName(): string;
    getNodeConstructorToJavascript(): string;
    _isAbstract(): boolean;
    private _cache_definedNodeConstructor;
    _getConstructorDefinedInGrammar(): Function;
    _getFirstWordMatch(): string;
    private _importNodeJsConstructor;
    private _importBrowserConstructor;
    static _cachedNodeConstructorsFromCode: {
        [code: string]: jTreeTypes.RunTimeNodeConstructor;
    };
    _initConstructorDefinedInGrammar(): Function;
    getCatchAllNodeConstructor(line: string): typeof GrammarDefinitionErrorNode;
    getLanguageDefinitionProgram(): GrammarProgram;
    protected _getCustomJavascriptMethods(): jTreeTypes.javascriptCode;
    private _cache_runTimeFirstWordToNodeConstructorMap;
    private _cache_runTimeFirstWordToNodeDefMap;
    getRunTimeFirstWordMap(): jTreeTypes.firstWordToNodeConstructorMap;
    getRunTimeFirstWordMapWithDefinitions(): {
        [firstWord: string]: NonRootNodeTypeDefinition;
    };
    getRunTimeFirstWordsInScope(): jTreeTypes.nodeTypeId[];
    getRequiredCellTypeIds(): jTreeTypes.cellTypeId[];
    _getCellGettersAndNodeTypeConstants(): string;
    getCatchAllCellTypeId(): jTreeTypes.cellTypeId | undefined;
    protected _createRunTimeFirstWordToNodeConstructorMap(nodeTypeIdsInScope: jTreeTypes.nodeTypeId[]): jTreeTypes.firstWordToNodeConstructorMap;
    protected _createRunTimeFirstWordToNodeDefMap(nodeTypeIdsInScope: jTreeTypes.nodeTypeId[]): {
        [firstWord: string]: NonRootNodeTypeDefinition;
    };
    getTopNodeTypeIds(): jTreeTypes.nodeTypeId[];
    protected _getMyInScopeNodeTypeIds(): jTreeTypes.nodeTypeId[];
    protected _getInScopeNodeTypeIds(): jTreeTypes.nodeTypeId[];
    isRequired(): boolean;
    _getRunTimeCatchAllNodeTypeId(): jTreeTypes.nodeTypeId;
    getNodeTypeDefinitionByNodeTypeId(nodeTypeId: jTreeTypes.nodeTypeId): AbstractGrammarDefinitionNode;
    _getCatchAllNodeTypeDefinition(): AbstractGrammarDefinitionNode;
    private _cache_catchAllConstructor;
    protected _initCatchAllNodeConstructorCache(): void;
    getFirstCellTypeId(): jTreeTypes.cellTypeId;
    isDefined(nodeTypeId: string): boolean;
    _getIdToNodeMap(): {
        [nodeTypeId: string]: NonRootNodeTypeDefinition;
    };
    protected _getProgramNodeTypeDefinitionCache(): {
        [nodeTypeId: string]: NonRootNodeTypeDefinition;
    };
    getRunTimeCatchAllNodeConstructor(): Function;
}
declare class NonRootNodeTypeDefinition extends AbstractGrammarDefinitionNode {
    _getRunTimeCatchAllNodeTypeId(): string;
    _getId(): string;
    private _cache_isRoot;
    _amIRoot(): boolean;
    _getCatchAllNodeConstructorToJavascript(): string;
    _getCompilerObject(): jTreeTypes.stringMap;
    getLineHints(): string;
    isOrExtendsANodeTypeInScope(firstWordsInScope: string[]): boolean;
    _getExtendsClassName(isCompiled?: boolean): jTreeTypes.javascriptClassPath;
    private _getFirstCellHighlightScope;
    getMatchBlock(): string;
    private _cache_nodeTypeInheritanceSet;
    private _cache_ancestorNodeTypeIdsArray;
    _getNodeTypeInheritanceSet(): Set<string>;
    getAncestorNodeTypeIdsArray(): jTreeTypes.nodeTypeId[];
    _getProgramNodeTypeDefinitionCache(): {
        [nodeTypeId: string]: NonRootNodeTypeDefinition;
    };
    getDoc(): string;
    getDescription(): string;
    getFrequency(): number;
    private _getExtendedNodeTypeId;
    _nodeDefToJavascriptClass(isCompiled?: boolean): jTreeTypes.javascriptCode;
}
declare class GrammarProgram extends AbstractGrammarDefinitionNode {
    getFirstWordMap(): jTreeTypes.stringMap;
    _getExtendsClassName(): string;
    _getId(): string;
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
    getConcreteAndAbstractNodeTypeDefinitions(): NonRootNodeTypeDefinition[];
    getTheGrammarFilePath(): string;
    private _cache_rootNodeTypeNode;
    _getRootNodeTypeDefinitionNode(): NonRootNodeTypeDefinition;
    getExtensionName(): string;
    getGrammarName(): string | undefined;
    protected _getMyInScopeNodeTypeIds(): jTreeTypes.nodeTypeId[];
    protected _getInScopeNodeTypeIds(): jTreeTypes.nodeTypeId[];
    private _cachedDefinitions;
    getNodeTypeDefinitionByFirstWordPath(firstWordPath: string): AbstractGrammarDefinitionNode;
    private _cache_nodeTypeDefinitions;
    protected _initProgramNodeTypeDefinitionCache(): void;
    _getProgramNodeTypeDefinitionCache(): {
        [nodeTypeId: string]: NonRootNodeTypeDefinition;
    };
    _getRunTimeCatchAllNodeTypeId(): string;
    private _getRootConstructor;
    private _cache_rootConstructorClass;
    getRootConstructor(): AbstractRuntimeProgramConstructorInterface;
    private _getFileExtensions;
    toNodeJsJavascript(jtreePath?: string): jTreeTypes.javascriptCode;
    toNodeJsJavascriptPrettier(jtreePath?: string): jTreeTypes.javascriptCode;
    toBrowserJavascript(): jTreeTypes.javascriptCode;
    toBrowserJavascriptPrettier(): jTreeTypes.javascriptCode;
    private _getProperName;
    _nodeDefToJavascriptClass(isCompiled: boolean, jtreePath: string, forNodeJs?: boolean): jTreeTypes.javascriptCode;
    toSublimeSyntaxFile(): string;
    static getTheAnyLanguageRootConstructor(): AbstractRuntimeProgramConstructorInterface;
}
export { GrammarConstants, GrammarStandardCellTypeIds, GrammarProgram, GrammarBackedBlobNode, GrammarBackedErrorNode, GrammarBackedRootNode, GrammarBackedTerminalNode, GrammarBackedNonTerminalNode };
