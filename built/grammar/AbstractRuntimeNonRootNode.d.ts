import AbstractRuntimeNode from "./AbstractRuntimeNode";
import { AbstractGrammarBackedCell } from "./GrammarBackedCell";
import GrammarCompilerNode from "./GrammarCompilerNode";
import types from "../types";
declare abstract class AbstractRuntimeNonRootNode extends AbstractRuntimeNode {
    getProgram(): AbstractRuntimeNode;
    getGrammarProgram(): import("./GrammarProgram").default;
    getDefinition(): import("./AbstractGrammarDefinitionNode").default;
    getCompilerNode(targetLanguage: types.targetLanguageId): GrammarCompilerNode;
    getParsedWords(): any[];
    getCompiledIndentation(targetLanguage: types.targetLanguageId): string;
    getCompiledLine(targetLanguage: types.targetLanguageId): string;
    compile(targetLanguage: types.targetLanguageId): string;
    getErrors(): types.ParseError[];
    readonly cells: types.stringMap;
    protected _getGrammarBackedCellArray(): AbstractGrammarBackedCell<any>[];
    getLineSyntax(): string;
    getLineHighlightScopes(defaultScope?: string): string;
}
export default AbstractRuntimeNonRootNode;
