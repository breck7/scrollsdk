import TreeNode from "../base/TreeNode";
import AbstractRuntimeProgramConstructorInterface from "./AbstractRuntimeProgramConstructorInterface";
import AbstractGrammarDefinitionNode from "./AbstractGrammarDefinitionNode";
import GrammarKeywordDefinitionNode from "./GrammarKeywordDefinitionNode";
import GrammarWordTypeNode from "./GrammarWordTypeNode";
import types from "../types";
declare class GrammarRootNode extends AbstractGrammarDefinitionNode {
    protected _getDefaultNodeConstructor(): any;
    getProgram(): GrammarProgram;
}
declare class GrammarProgram extends AbstractGrammarDefinitionNode {
    getKeywordMap(): {};
    getProgramErrors(): types.ParseError[];
    getNodeConstructor(line: any): any;
    getTargetExtension(): string;
    private _cache_wordTypes;
    getWordTypes(): {
        [name: string]: GrammarWordTypeNode;
    };
    getWordType(word: string): GrammarWordTypeNode;
    protected _getWordTypes(): {};
    getProgram(): this;
    getKeywordDefinitions(): GrammarKeywordDefinitionNode[];
    getTheGrammarFilePath(): string;
    protected _getGrammarRootNode(): GrammarRootNode;
    getExtensionName(): string;
    protected _getKeywordsNode(): TreeNode;
    private _cachedDefinitions;
    getKeywordDefinitionByKeywordPath(keywordPath: string): AbstractGrammarDefinitionNode;
    getDocs(): string;
    private _cache_keywordDefinitions;
    protected _initProgramKeywordDefinitionCache(): any;
    _getProgramKeywordDefinitionCache(): {
        [keyword: string]: GrammarKeywordDefinitionNode;
    };
    _getRunTimeCatchAllKeyword(): string;
    protected _getRootConstructor(): AbstractRuntimeProgramConstructorInterface;
    private _cache_rootConstructorClass;
    getRootConstructor(): AbstractRuntimeProgramConstructorInterface;
    getNodeColumnRegexes(): any[];
    toSublimeSyntaxFile(): string;
    static newFromCondensed(grammarCode: string, grammarPath?: types.filepath): GrammarProgram;
    static _getBestType(values: any): "any" | "int" | "float" | "bit" | "bool";
    static predictGrammarFile(str: any, keywords?: any): string;
}
export default GrammarProgram;
