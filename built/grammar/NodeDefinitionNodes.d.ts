import TreeNode from "../base/TreeNode";
import jTreeTypes from "../jTreeTypes";
import GrammarCellTypeDefinitionNode from "./GrammarCellTypeDefinitionNode";
import AbstractRuntimeProgramConstructorInterface from "./AbstractRuntimeProgramConstructorInterface";
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
    _shouldBeJustOne(): boolean;
    _getRunTimeCatchAllNodeTypeId(): jTreeTypes.nodeTypeId;
    getNodeTypeDefinitionByNodeTypeId(nodeTypeId: jTreeTypes.nodeTypeId): AbstractGrammarDefinitionNode;
    _getCatchAllNodeTypeDefinition(): AbstractGrammarDefinitionNode;
    private _cache_catchAllConstructor;
    protected _initCatchAllNodeConstructorCache(): void;
    getFirstCellTypeId(): jTreeTypes.cellTypeId;
    isDefined(nodeTypeId: string): boolean;
    _getProgramNodeTypeDefinitionCache(): {
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
    protected _getRootConstructor(): AbstractRuntimeProgramConstructorInterface;
    private _cache_rootConstructorClass;
    getRootConstructor(): AbstractRuntimeProgramConstructorInterface;
    private _getFileExtensions;
    toNodeJsJavascript(jtreePath?: string): jTreeTypes.javascriptCode;
    toBrowserJavascript(): jTreeTypes.javascriptCode;
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
export { AbstractGrammarDefinitionNode, GrammarNodeTypeDefinitionNode, GrammarProgram, GrammarCompilerNode };
