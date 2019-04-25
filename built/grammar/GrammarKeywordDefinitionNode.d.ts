import AbstractGrammarDefinitionNode from "./AbstractGrammarDefinitionNode";
declare class GrammarKeywordDefinitionNode extends AbstractGrammarDefinitionNode {
    _getRunTimeCatchAllKeyword(): string;
    isOrExtendsAKeywordInScope(keywordsInScope: string[]): boolean;
    getSyntaxContextId(): string;
    getMatchBlock(): string;
    private _cache_keywordInheritanceSet;
    getKeywordInheritanceSet(): Set<string>;
    protected _getParentKeyword(): string;
    protected _initKeywordInheritanceSetCache(): any;
    _getProgramKeywordDefinitionCache(): {
        [keyword: string]: GrammarKeywordDefinitionNode;
    };
    getDoc(): string;
    protected _getDefaultsNode(): any;
    getDefaultFor(name: string): any;
    getDescription(): string;
    getConstantsObject(): {};
    getFrequency(): number;
}
export default GrammarKeywordDefinitionNode;
