import AbstractRuntimeNode from "./AbstractRuntimeNode";
import { AbstractGrammarBackedCell } from "./GrammarBackedCell";
import GrammarCompilerNode from "./GrammarCompilerNode";
import GrammarNodeTypeDefinitionNode from "./GrammarNodeTypeDefinitionNode";
import jTreeTypes from "../jTreeTypes";
declare abstract class AbstractRuntimeNonRootNode extends AbstractRuntimeNode {
    getProgram(): AbstractRuntimeNode;
    getGrammarProgram(): import("./GrammarProgram").default;
    getDefinition(): GrammarNodeTypeDefinitionNode;
    getCompilerNode(targetLanguage: jTreeTypes.targetLanguageId): GrammarCompilerNode;
    getParsedWords(): any[];
    getCompiledIndentation(targetLanguage: jTreeTypes.targetLanguageId): string;
    getCompiledLine(targetLanguage: jTreeTypes.targetLanguageId): string;
    compile(targetLanguage: jTreeTypes.targetLanguageId): string;
    getErrors(): jTreeTypes.TreeError[];
    readonly cells: jTreeTypes.stringMap;
    private _getExtraWordCellTypeName;
    protected _getGrammarBackedCellArray(): AbstractGrammarBackedCell<any>[];
    getLineCellTypes(): string;
    getLineHighlightScopes(defaultScope?: string): string;
}
export default AbstractRuntimeNonRootNode;
