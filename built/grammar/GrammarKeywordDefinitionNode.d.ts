import AbstractGrammarDefinitionNode from "./AbstractGrammarDefinitionNode";
declare class GrammarKeywordDefinitionNode extends AbstractGrammarDefinitionNode {
    _getRunTimeCatchAllKeyword(): string;
    isOrExtendsAKeywordInScope(keywordsInScope: string[]): boolean;
    _getHighlightScope(): any;
    getSyntaxContextId(): string;
    getMatchBlock(): string;
    private _cache_keywordChain;
    protected _getKeywordChain(): any;
    protected _getParentKeyword(): string;
    protected _initKeywordChainCache(): any;
    _getProgramKeywordDefinitionCache(): any;
    getDoc(): string;
    protected _getDefaultsNode(): any;
    getDefaultFor(name: any): any;
    getDescription(): any;
    getConstantsObject(): {};
    getFrequency(): number;
}
export default GrammarKeywordDefinitionNode;
