import TreeNode from "./base/TreeNode";
import jTreeTypes from "./jTreeTypes";
interface AbstractRuntimeProgramConstructorInterface {
    new (code: string): AbstractRuntimeProgramRootNode;
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
    grammar = "grammar",
    extensions = "extensions",
    toolingDirective = "tooling",
    version = "version",
    name = "name",
    nodeTypeOrder = "nodeTypeOrder",
    nodeType = "nodeType",
    cellType = "cellType",
    abstract = "abstract",
    regex = "regex",
    enumFromGrammar = "enumFromGrammar",
    enum = "enum",
    inScope = "inScope",
    cells = "cells",
    catchAllCellType = "catchAllCellType",
    firstCellType = "firstCellType",
    catchAllNodeType = "catchAllNodeType",
    defaults = "defaults",
    constants = "constants",
    group = "group",
    blob = "blob",
    required = "required",
    single = "single",
    tags = "tags",
    constructors = "constructors",
    constructorNodeJs = "nodejs",
    constructorBrowser = "browser",
    constructorJavascript = "javascript",
    compilerNodeType = "compiler",
    description = "description",
    example = "example",
    frequency = "frequency",
    highlightScope = "highlightScope"
}
declare abstract class CompiledLanguageNonRootNode extends TreeNode {
}
declare abstract class CompiledLanguageRootNode extends TreeNode {
}
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
declare class GrammarCellTypeDefinitionNode extends TreeNode {
    getFirstWordMap(): jTreeTypes.stringMap;
    getCellConstructor(): any;
    getHighlightScope(): string | undefined;
    private _getEnumOptions;
    private _getEnumFromGrammarOptions;
    getAutocompleteWordOptions(runTimeProgram: AbstractRuntimeProgramRootNode): string[];
    getRegexString(): string;
    isValid(str: string, runTimeGrammarBackedProgram: AbstractRuntimeProgramRootNode): boolean;
    getCellTypeId(): jTreeTypes.cellTypeId;
    static types: any;
}
declare class GrammarDefinitionErrorNode extends TreeNode {
    getErrors(): jTreeTypes.TreeError[];
    getLineCellTypes(): string;
}
declare class GrammarExampleNode extends TreeNode {
}
declare class GrammarCompilerNode extends TreeNode {
    getFirstWordMap(): jTreeTypes.firstWordToNodeConstructorMap;
    getTargetExtension(): string;
    getListDelimiter(): string;
    getTransformation(): string;
    getIndentCharacter(): string;
    getOpenChildrenString(): string;
    getCloseChildrenString(): string;
}
declare abstract class AbstractGrammarDefinitionNode extends TreeNode {
    getFirstWordMap(): jTreeTypes.firstWordToNodeConstructorMap;
    getExamples(): GrammarExampleNode[];
    getNodeTypeIdFromDefinition(): jTreeTypes.nodeTypeId;
    getGeneratedClassName(): string;
    getNodeConstructorToJavascript(): string;
    protected _isNonTerminal(): boolean;
    _isAbstract(): boolean;
    protected _isBlobNode(): boolean;
    private _cache_definedNodeConstructor;
    getConstructorDefinedInGrammar(): Function;
    protected _getDefaultNodeConstructor(): jTreeTypes.RunTimeNodeConstructor;
    protected _getDefinedNodeConstructor(): jTreeTypes.RunTimeNodeConstructor;
    getCatchAllNodeConstructor(line: string): typeof GrammarDefinitionErrorNode;
    getProgram(): GrammarProgram;
    getDefinitionCompilerNode(targetLanguage: jTreeTypes.targetLanguageId, node: TreeNode): GrammarCompilerNode;
    protected _getCompilerNodes(): GrammarCompilerNode[];
    getTargetExtension(): string;
    private _cache_runTimeFirstWordToNodeConstructorMap;
    getRunTimeFirstWordMap(): jTreeTypes.firstWordToNodeConstructorMap;
    getRunTimeFirstWordsInScope(): jTreeTypes.nodeTypeId[];
    getRunTimeFirstWordMapWithDefinitions(): {
        [key: string]: GrammarNodeTypeDefinitionNode;
    };
    getRequiredCellTypeIds(): jTreeTypes.cellTypeId[];
    getGetters(): string[];
    getCatchAllCellTypeId(): jTreeTypes.cellTypeId | undefined;
    protected _createRunTimeFirstWordToNodeConstructorMap(nodeTypeIdsInScope: jTreeTypes.nodeTypeId[]): jTreeTypes.firstWordToNodeConstructorMap;
    getTopNodeTypeIds(): jTreeTypes.nodeTypeId[];
    protected _getParentDefinition(): AbstractGrammarDefinitionNode;
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
    protected _getProgramNodeTypeDefinitionCache(): {
        [nodeTypeId: string]: GrammarNodeTypeDefinitionNode;
    };
    getRunTimeCatchAllNodeConstructor(): Function;
}
declare class GrammarNodeTypeDefinitionNode extends AbstractGrammarDefinitionNode {
    _getRunTimeCatchAllNodeTypeId(): string;
    isOrExtendsANodeTypeInScope(firstWordsInScope: string[]): boolean;
    getSublimeSyntaxContextId(): string;
    getConstantsObject(): jTreeTypes.stringMap;
    private _getFirstCellHighlightScope;
    protected _getParentDefinition(): AbstractGrammarDefinitionNode;
    getMatchBlock(): string;
    private _cache_nodeTypeInheritanceSet;
    private _cache_ancestorNodeTypeIdsArray;
    getNodeTypeInheritanceSet(): Set<string>;
    private _getIdOfNodeTypeThatThisExtends;
    getAncestorNodeTypeIdsArray(): jTreeTypes.nodeTypeId[];
    protected _initNodeTypeInheritanceCache(): void;
    _getProgramNodeTypeDefinitionCache(): {
        [nodeTypeId: string]: GrammarNodeTypeDefinitionNode;
    };
    getDoc(): string;
    private _getDefaultsNode;
    getDefaultFor(name: string): string;
    getDescription(): string;
    getFrequency(): number;
    private _getExtendedNodeTypeId;
    _toJavascript(): jTreeTypes.javascriptCode;
}
declare class GrammarRootNode extends AbstractGrammarDefinitionNode {
    protected _getDefaultNodeConstructor(): jTreeTypes.RunTimeNodeConstructor;
    getProgram(): GrammarProgram;
    getFirstWordMap(): jTreeTypes.firstWordToNodeConstructorMap;
}
declare class GrammarProgram extends AbstractGrammarDefinitionNode {
    getFirstWordMap(): jTreeTypes.stringMap;
    getProgramErrors(): jTreeTypes.TreeError[];
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
    getProgram(): this;
    getNodeTypeDefinitions(): GrammarNodeTypeDefinitionNode[];
    getTheGrammarFilePath(): string;
    protected _getGrammarRootNode(): GrammarRootNode;
    getExtensionName(): string;
    getGrammarName(): string | undefined;
    protected _getInScopeNodeTypeIds(): jTreeTypes.nodeTypeId[];
    private _cachedDefinitions;
    getNodeTypeDefinitionByFirstWordPath(firstWordPath: string): AbstractGrammarDefinitionNode;
    getDocs(): string;
    private _cache_nodeTypeDefinitions;
    protected _initProgramNodeTypeDefinitionCache(): void;
    _getProgramNodeTypeDefinitionCache(): {
        [nodeTypeId: string]: GrammarNodeTypeDefinitionNode;
    };
    _getRunTimeCatchAllNodeTypeId(): string;
    private _getRootConstructor;
    private _cache_rootConstructorClass;
    getRootConstructor(): AbstractRuntimeProgramConstructorInterface;
    private _getFileExtensions;
    toNodeJsJavascript(jtreePath?: string): jTreeTypes.javascriptCode;
    toBrowserJavascript(): jTreeTypes.javascriptCode;
    private _getProperName;
    private _getRootClassName;
    private _toJavascript;
    toSublimeSyntaxFile(): string;
    static getTheAnyLanguageRootConstructor(): AbstractRuntimeProgramConstructorInterface;
    static _condensedToExpanded(grammarCode: string): TreeNode;
    static newFromCondensed(grammarCode: string, grammarPath?: jTreeTypes.filepath): GrammarProgram;
    loadAllConstructorScripts(baseUrlPath: string): Promise<string[]>;
    private static _scriptLoadingPromises;
    private static _appendScriptOnce;
    private static _appendScript;
}
export { GrammarConstants, GrammarStandardCellTypeIds, GrammarProgram, AbstractRuntimeNode, AbstractRuntimeProgramRootNode, GrammarBackedTerminalNode, GrammarBackedNonTerminalNode, CompiledLanguageNonRootNode, CompiledLanguageRootNode, GrammarBackedBlobNode };
