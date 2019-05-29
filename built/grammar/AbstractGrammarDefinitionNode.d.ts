import TreeNode from "../base/TreeNode";
import GrammarDefinitionErrorNode from "./GrammarDefinitionErrorNode";
import GrammarCompilerNode from "./GrammarCompilerNode";
import GrammarProgram from "./GrammarProgram";
import GrammarNodeTypeDefinitionNode from "./GrammarNodeTypeDefinitionNode";
import jTreeTypes from "../jTreeTypes";
declare abstract class AbstractGrammarDefinitionNode extends TreeNode {
    getFirstWordMap(): jTreeTypes.firstWordToNodeConstructorMap;
    getNodeTypeIdFromDefinition(): string;
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
    getRunTimeNodeTypeNames(): string[];
    getRunTimeFirstWordMapWithDefinitions(): {
        [key: string]: GrammarNodeTypeDefinitionNode;
    };
    getRequiredCellTypeNames(): string[];
    getCatchAllCellTypeName(): string | undefined;
    protected _initRunTimeFirstWordToNodeConstructorMap(): void;
    _getNodeTypesInScope(): string[];
    getTopNodeTypeIds(): string[];
    protected _getNodeTypesNode(): TreeNode;
    isRequired(): boolean;
    isSingle(): boolean;
    _getRunTimeCatchAllNodeTypeId(): string;
    getNodeTypeDefinitionByName(firstWord: string): AbstractGrammarDefinitionNode;
    _getCatchAllDefinition(): AbstractGrammarDefinitionNode;
    private _cache_catchAllConstructor;
    protected _initCatchAllNodeConstructorCache(): void;
    getFirstCellType(): string;
    isDefined(firstWord: string): boolean;
    _getProgramNodeTypeDefinitionCache(): {
        [firstWord: string]: GrammarNodeTypeDefinitionNode;
    };
    getRunTimeCatchAllNodeConstructor(): Function;
}
export default AbstractGrammarDefinitionNode;
