import AbstractRuntimeNode from "./AbstractRuntimeNode";
import { AbstractGrammarBackedCell } from "./GrammarBackedCell";
import GrammarCompilerNode from "./GrammarCompilerNode";
import GrammarNodeTypeDefinitionNode from "./GrammarNodeTypeDefinitionNode";
import types from "../types";
declare abstract class AbstractRuntimeNonRootNode extends AbstractRuntimeNode {
    getProgram(): AbstractRuntimeNode;
    getGrammarProgram(): import("./GrammarProgram").default;
    getDefinition(): GrammarNodeTypeDefinitionNode;
    getCompilerNode(targetLanguage: types.targetLanguageId): GrammarCompilerNode;
    getParsedWords(): any[];
    getCompiledIndentation(targetLanguage: types.targetLanguageId): string;
    getCompiledLine(targetLanguage: types.targetLanguageId): string;
    compile(targetLanguage: types.targetLanguageId): string;
    getErrors(): types.ParseError[];
    readonly cells: types.stringMap;
    private _getExtraWordCellTypeName;
    protected _getGrammarBackedCellArray(): AbstractGrammarBackedCell<any>[];
    getLineCellTypes(): string;
    getLineHighlightScopes(defaultScope?: string): string;
}
export default AbstractRuntimeNonRootNode;
