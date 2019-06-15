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
    baseNodeType = "baseNodeType",
    blobNode = "blobNode",
    errorNode = "errorNode",
    terminalNode = "terminalNode",
    nonTerminalNode = "nonTerminalNode",
    inScope = "inScope",
    cells = "cells",
    catchAllCellType = "catchAllCellType",
    firstCellType = "firstCellType",
    catchAllNodeType = "catchAllNodeType",
    defaults = "defaults",
    constants = "constants",
    group = "group",
    required = "required",
    single = "single",
    tags = "tags",
    javascript = "javascript",
    constructors = "constructors",
    constructorNodeJs = "nodejs",
    constructorBrowser = "browser",
    compilerNodeType = "compiler",
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
    getLineHints(): string;
    getNodeTypeId(): jTreeTypes.nodeTypeId;
    getDefinition(): NonRootNodeTypeDefinition;
    getGrammarProgramRoot(): GrammarProgram;
    protected _getGrammarBackedCellArray(): AbstractGrammarBackedCell<any>[];
    getLineCellTypes(): string;
    getLineHighlightScopes(defaultScope?: string): string;
    getErrors(): jTreeTypes.TreeError[];
}
declare abstract class AbstractRuntimeNonRootNode extends GrammarBackedNonRootNode {
    protected _getCompilerNode(targetLanguage: jTreeTypes.targetLanguageId): GrammarCompilerNode;
    protected _getCompiledIndentation(targetLanguage: jTreeTypes.targetLanguageId): string;
    protected _getCompiledLine(targetLanguage: jTreeTypes.targetLanguageId): string;
    compile(targetLanguage: jTreeTypes.targetLanguageId): string;
    readonly cells: jTreeTypes.stringMap;
}
declare abstract class AbstractRuntimeProgramRootNode extends GrammarBackedRootNode {
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
declare class GrammarCellTypeDefinitionNode extends TreeNode {
    getFirstWordMap(): jTreeTypes.stringMap;
    getGetter(wordIndex: number): string;
    getCatchAllGetter(wordIndex: number): string;
    getCellConstructor(): typeof AbstractGrammarBackedCell;
    getHighlightScope(): string | undefined;
    private _getEnumOptions;
    private _getEnumFromGrammarOptions;
    getAutocompleteWordOptions(programRootNode: GrammarBackedRootNode): string[];
    getRegexString(): string;
    isValid(str: string, programRootNode: GrammarBackedRootNode): boolean;
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
    _getTargetExtension(): string;
    _getListDelimiter(): string;
    _getTransformation(): string;
    _getIndentCharacter(): string;
    _getOpenChildrenString(): string;
    _getCloseChildrenString(): string;
}
declare abstract class AbstractGrammarDefinitionNode extends TreeNode {
    getFirstWordMap(): jTreeTypes.firstWordToNodeConstructorMap;
    getExamples(): GrammarExampleNode[];
    getNodeTypeIdFromDefinition(): jTreeTypes.nodeTypeId;
    abstract _nodeDefToJavascriptClass(isCompiled: boolean, jTreePath?: string, forNodeJs?: boolean): jTreeTypes.javascriptCode;
    abstract _getExtendsClassName(isCompiled: boolean): jTreeTypes.javascriptClassPath;
    _getGeneratedClassName(): string;
    getNodeConstructorToJavascript(): string;
    _isAbstract(): boolean;
    private _cache_definedNodeConstructor;
    getConstructorDefinedInGrammar(): Function;
    private _getBaseNodeType;
    protected _getDefaultNodeConstructor(): jTreeTypes.RunTimeNodeConstructor;
    protected _getDefinedNodeConstructor(): jTreeTypes.RunTimeNodeConstructor;
    protected _getDefinedCustomJSConstructor(): jTreeTypes.RunTimeNodeConstructor;
    getCatchAllNodeConstructor(line: string): typeof GrammarDefinitionErrorNode;
    getLanguageDefinitionProgram(): GrammarProgram;
    getDefinitionCompilerNode(targetLanguage: jTreeTypes.targetLanguageId, node: TreeNode): GrammarCompilerNode;
    protected _getCompilerNodes(): GrammarCompilerNode[];
    getTargetExtension(): string;
    private _cache_runTimeFirstWordToNodeConstructorMap;
    getRunTimeFirstWordMap(): jTreeTypes.firstWordToNodeConstructorMap;
    getRunTimeFirstWordsInScope(): jTreeTypes.nodeTypeId[];
    getRunTimeFirstWordMapWithDefinitions(): {
        [key: string]: NonRootNodeTypeDefinition;
    };
    getRequiredCellTypeIds(): jTreeTypes.cellTypeId[];
    _getDefNode(): this;
    _getGetters(): string;
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
        [nodeTypeId: string]: NonRootNodeTypeDefinition;
    };
    getRunTimeCatchAllNodeConstructor(): Function;
}
declare class NonRootNodeTypeDefinition extends AbstractGrammarDefinitionNode {
    _getRunTimeCatchAllNodeTypeId(): string;
    isOrExtendsANodeTypeInScope(firstWordsInScope: string[]): boolean;
    getSublimeSyntaxContextId(): string;
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
        [nodeTypeId: string]: NonRootNodeTypeDefinition;
    };
    getDoc(): string;
    private _getDefaultsNode;
    getDefaultFor(name: string): string;
    getDescription(): string;
    getFrequency(): number;
    private _getExtendedNodeTypeId;
    private _getCustomJavascriptMethods;
    _getExtendsClassName(isCompiled?: boolean): string;
    _nodeDefToJavascriptClass(isCompiled?: boolean): jTreeTypes.javascriptCode;
}
declare class GrammarRootNode extends AbstractGrammarDefinitionNode {
    protected _getDefaultNodeConstructor(): jTreeTypes.RunTimeNodeConstructor;
    _nodeDefToJavascriptClass(): string;
    _getExtendsClassName(): string;
    getLanguageDefinitionProgram(): GrammarProgram;
    protected _getDefinedCustomJSConstructor(): jTreeTypes.RunTimeNodeConstructor;
    getFirstWordMap(): jTreeTypes.firstWordToNodeConstructorMap;
}
declare class GrammarProgram extends AbstractGrammarDefinitionNode {
    getFirstWordMap(): jTreeTypes.stringMap;
    _getExtendsClassName(isCompiled?: boolean): "jtree.CompiledLanguageRootNode" | "jtree.programRoot";
    private _getCustomJavascriptMethods;
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
    getNodeTypeDefinitions(): NonRootNodeTypeDefinition[];
    getTheGrammarFilePath(): string;
    protected _getGrammarRootNode(): GrammarRootNode;
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
    private _getProperName;
    _getGeneratedClassName(): string;
    private _getCatchAllNodeConstructorToJavascript;
    _escapeBackTicks(str: string): string;
    _nodeDefToJavascriptClass(isCompiled: boolean, jtreePath: string, forNodeJs?: boolean): jTreeTypes.javascriptCode;
    toSublimeSyntaxFile(): string;
    static getTheAnyLanguageRootConstructor(): AbstractRuntimeProgramConstructorInterface;
    static _condensedToExpanded(grammarCode: string): TreeNode;
    static newFromCondensed(grammarCode: string, grammarPath?: jTreeTypes.filepath): GrammarProgram;
    loadAllConstructorScripts(baseUrlPath: string): Promise<string[]>;
    private static _scriptLoadingPromises;
    private static _appendScriptOnce;
    private static _appendScript;
}
declare abstract class CompiledLanguageNonRootNode extends GrammarBackedNonRootNode {
}
declare abstract class CompiledLanguageRootNode extends GrammarBackedRootNode {
}
export { GrammarConstants, GrammarStandardCellTypeIds, GrammarProgram, AbstractRuntimeProgramRootNode, GrammarBackedTerminalNode, GrammarBackedNonTerminalNode, CompiledLanguageNonRootNode, CompiledLanguageRootNode };
