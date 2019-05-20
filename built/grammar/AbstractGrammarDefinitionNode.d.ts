import TreeNode from "../base/TreeNode";
import GrammarDefinitionErrorNode from "./GrammarDefinitionErrorNode";
import GrammarCompilerNode from "./GrammarCompilerNode";
import GrammarProgram from "./GrammarProgram";
import GrammarNodeTypeDefinitionNode from "./GrammarNodeTypeDefinitionNode";
import types from "../types";
declare abstract class AbstractGrammarDefinitionNode extends TreeNode {
    getFirstWordMap(): types.firstWordToNodeConstructorMap;
    getNodeTypeIdFromDefinition(): string;
    protected _isNonTerminal(): boolean;
    _isAbstract(): boolean;
    protected _isBlobNode(): boolean;
    private _cache_definedNodeConstructor;
    getConstructorDefinedInGrammar(): Function;
    protected _getDefaultNodeConstructor(): types.RunTimeNodeConstructor;
    protected _getDefinedNodeConstructor(): types.RunTimeNodeConstructor;
    getCatchAllNodeConstructor(line: string): typeof GrammarDefinitionErrorNode;
    getProgram(): GrammarProgram;
    getDefinitionCompilerNode(targetLanguage: types.targetLanguageId, node: TreeNode): GrammarCompilerNode;
    protected _getCompilerNodes(): GrammarCompilerNode[];
    getTargetExtension(): string;
    private _cache_runTimeFirstWordToNodeConstructorMap;
    getRunTimeFirstWordMap(): types.firstWordToNodeConstructorMap;
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
