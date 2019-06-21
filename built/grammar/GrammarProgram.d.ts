import TreeNode from "../base/TreeNode";
import AbstractGrammarDefinitionNode from "./AbstractGrammarDefinitionNode";
import GrammarNodeTypeDefinitionNode from "./GrammarNodeTypeDefinitionNode";
import GrammarCellTypeDefinitionNode from "./GrammarCellTypeDefinitionNode";
import jTreeTypes from "../jTreeTypes";
import AbstractRuntimeProgramConstructorInterface from "./AbstractRuntimeProgramConstructorInterface";
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
export default GrammarProgram;
