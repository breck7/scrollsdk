import TreeNode from "../base/TreeNode";
import AbstractRuntimeProgramConstructorInterface from "./AbstractRuntimeProgramConstructorInterface";
import AbstractGrammarDefinitionNode from "./AbstractGrammarDefinitionNode";
import GrammarKeywordDefinitionNode from "./GrammarKeywordDefinitionNode";
import GrammarCellTypeDefinitionNode from "./GrammarCellTypeDefinitionNode";
import types from "../types";
declare class GrammarRootNode extends AbstractGrammarDefinitionNode {
    protected _getDefaultNodeConstructor(): types.RunTimeNodeConstructor;
    getProgram(): GrammarProgram;
    getKeywordMap(): types.keywordToNodeMap;
}
declare class GrammarProgram extends AbstractGrammarDefinitionNode {
    getKeywordMap(): types.stringMap;
    getProgramErrors(): types.ParseError[];
    getErrorsInGrammarExamples(): types.ParseError[];
    getTargetExtension(): string;
    getKeywordOrder(): string;
    private _cache_cellTypes;
    getCellTypeDefinitions(): {
        [name: string]: GrammarCellTypeDefinitionNode;
    };
    getCellTypeDefinition(word: string): GrammarCellTypeDefinitionNode;
    protected _getCellTypeDefinitions(): {
        [typeName: string]: GrammarCellTypeDefinitionNode;
    };
    getProgram(): this;
    getKeywordDefinitions(): GrammarKeywordDefinitionNode[];
    getTheGrammarFilePath(): string;
    protected _getGrammarRootNode(): GrammarRootNode;
    getExtensionName(): string;
    getGrammarName(): string | undefined;
    protected _getKeywordsNode(): TreeNode;
    private _cachedDefinitions;
    getKeywordDefinitionByKeywordPath(keywordPath: string): AbstractGrammarDefinitionNode;
    getDocs(): string;
    private _cache_keywordDefinitions;
    protected _initProgramKeywordDefinitionCache(): void;
    _getProgramKeywordDefinitionCache(): {
        [keyword: string]: GrammarKeywordDefinitionNode;
    };
    _getRunTimeCatchAllKeyword(): string;
    protected _getRootConstructor(): AbstractRuntimeProgramConstructorInterface;
    private _cache_rootConstructorClass;
    getRootConstructor(): AbstractRuntimeProgramConstructorInterface;
    private _getFileExtensions;
    toSublimeSyntaxFile(): string;
    static getTheAnyLanguageRootConstructor(): AbstractRuntimeProgramConstructorInterface;
    static newFromCondensed(grammarCode: string, grammarPath?: types.filepath): GrammarProgram;
}
export default GrammarProgram;
