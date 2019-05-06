import TreeNode from "../base/TreeNode";
import GrammarDefinitionErrorNode from "./GrammarDefinitionErrorNode";
import GrammarCompilerNode from "./GrammarCompilerNode";
import GrammarProgram from "./GrammarProgram";
import GrammarKeywordDefinitionNode from "./GrammarKeywordDefinitionNode";
import types from "../types";
declare abstract class AbstractGrammarDefinitionNode extends TreeNode {
    getKeywordMap(): types.keywordToNodeMap;
    getId(): string;
    protected _isNonTerminal(): boolean;
    _isAbstract(): boolean;
    protected _isAnyNode(): boolean;
    private _cache_definedNodeConstructor;
    getDefinedConstructor(): Function;
    protected _getDefaultNodeConstructor(): types.RunTimeNodeConstructor;
    protected _getDefinedNodeConstructor(): types.RunTimeNodeConstructor;
    getCatchAllNodeConstructor(line: string): typeof GrammarDefinitionErrorNode;
    getProgram(): GrammarProgram;
    getDefinitionCompilerNode(targetLanguage: types.targetLanguageId, node: TreeNode): GrammarCompilerNode;
    protected _getCompilerNodes(): GrammarCompilerNode[];
    getTargetExtension(): string;
    private _cache_keywordsMap;
    getRunTimeKeywordMap(): types.keywordToNodeMap;
    getRunTimeKeywordNames(): string[];
    getRunTimeKeywordMapWithDefinitions(): {
        [key: string]: GrammarKeywordDefinitionNode;
    };
    getRequiredCellTypeNames(): string[];
    getCatchAllCellTypeName(): string | undefined;
    protected _initKeywordsMapCache(): void;
    _getKeywordsInScope(): string[];
    getTopNodeTypes(): string[];
    protected _getKeywordsNode(): TreeNode;
    isRequired(): boolean;
    isSingle(): boolean;
    _getRunTimeCatchAllKeyword(): string;
    getKeywordDefinitionByName(keyword: string): AbstractGrammarDefinitionNode;
    _getCatchAllDefinition(): AbstractGrammarDefinitionNode;
    private _cache_catchAllConstructor;
    protected _initCatchAllNodeConstructorCache(): void;
    getHighlightScope(): string | undefined;
    isDefined(keyword: string): boolean;
    _getProgramKeywordDefinitionCache(): {
        [keyword: string]: GrammarKeywordDefinitionNode;
    };
    getRunTimeCatchAllNodeConstructor(): Function;
}
export default AbstractGrammarDefinitionNode;
