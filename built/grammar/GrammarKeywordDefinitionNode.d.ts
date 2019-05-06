import GrammarExampleNode from "./GrammarExampleNode";
import AbstractGrammarDefinitionNode from "./AbstractGrammarDefinitionNode";
import types from "../types";
declare class GrammarKeywordDefinitionNode extends AbstractGrammarDefinitionNode {
    _getRunTimeCatchAllKeyword(): string;
    isOrExtendsAKeywordInScope(keywordsInScope: string[]): boolean;
    getSyntaxContextId(): string;
    getMatchBlock(): string;
    private _cache_keywordInheritanceSet;
    getKeywordInheritanceSet(): Set<string>;
    protected _getParentKeyword(): string;
    protected _initKeywordInheritanceSetCache(): void;
    _getProgramKeywordDefinitionCache(): {
        [keyword: string]: GrammarKeywordDefinitionNode;
    };
    getDoc(): string;
    private _getDefaultsNode;
    getDefaultFor(name: string): string;
    getDescription(): string;
    getExamples(): GrammarExampleNode[];
    getConstantsObject(): types.stringMap;
    getFrequency(): number;
}
export default GrammarKeywordDefinitionNode;
