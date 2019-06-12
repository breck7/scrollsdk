import TreeNode from "../base/TreeNode";
import GrammarCompilerNode from "./GrammarCompilerNode";
import GrammarProgram from "./GrammarProgram";
import GrammarNodeTypeDefinitionNode from "./GrammarNodeTypeDefinitionNode";
import jTreeTypes from "../jTreeTypes";
declare class GrammarDefinitionErrorNode extends TreeNode {
    getErrors(): jTreeTypes.TreeError[];
    getLineCellTypes(): string;
}
declare abstract class AbstractGrammarDefinitionNode extends TreeNode {
    getFirstWordMap(): jTreeTypes.firstWordToNodeConstructorMap;
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
    getRunTimeNodeTypeIds(): jTreeTypes.nodeTypeId[];
    getRunTimeFirstWordMapWithDefinitions(): {
        [key: string]: GrammarNodeTypeDefinitionNode;
    };
    getRequiredCellTypeIds(): jTreeTypes.cellTypeId[];
    getGetters(): string[];
    getCatchAllCellTypeId(): jTreeTypes.cellTypeId | undefined;
    protected _initRunTimeFirstWordToNodeConstructorMap(): void;
    getTopNodeTypeIds(): jTreeTypes.nodeTypeId[];
    protected _getParentDefinition(): AbstractGrammarDefinitionNode;
    protected _getInScopeNodeTypeIds(): jTreeTypes.nodeTypeId[];
    isRequired(): boolean;
    _shouldBeJustOne(): boolean;
    _getRunTimeCatchAllNodeTypeId(): jTreeTypes.nodeTypeId;
    getNodeTypeDefinitionByName(firstWord: string): AbstractGrammarDefinitionNode;
    _getCatchAllDefinition(): AbstractGrammarDefinitionNode;
    private _cache_catchAllConstructor;
    protected _initCatchAllNodeConstructorCache(): void;
    getFirstCellTypeId(): jTreeTypes.cellTypeId;
    isDefined(firstWord: string): boolean;
    _getProgramNodeTypeDefinitionCache(): {
        [firstWord: string]: GrammarNodeTypeDefinitionNode;
    };
    getRunTimeCatchAllNodeConstructor(): Function;
}
export default AbstractGrammarDefinitionNode;
