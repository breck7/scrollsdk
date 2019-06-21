import AbstractRuntimeNode from "./AbstractRuntimeNode";
import { AbstractGrammarBackedCell } from "./GrammarBackedCell";
import GrammarCompilerNode from "./GrammarCompilerNode";
import GrammarNodeTypeDefinitionNode from "./GrammarNodeTypeDefinitionNode";
import jTreeTypes from "../jTreeTypes";
declare abstract class AbstractRuntimeNonRootNode extends AbstractRuntimeNode {
    getProgram(): AbstractRuntimeNode;
    getGrammarProgram(): import("./GrammarProgram").default;
    getNodeTypeId(): jTreeTypes.nodeTypeId;
    getDefinition(): GrammarNodeTypeDefinitionNode;
    getConstantsObject(): jTreeTypes.stringMap;
    protected _getCompilerNode(targetLanguage: jTreeTypes.targetLanguageId): GrammarCompilerNode;
    protected _getCompiledIndentation(targetLanguage: jTreeTypes.targetLanguageId): string;
    protected _getCompiledLine(targetLanguage: jTreeTypes.targetLanguageId): string;
    compile(targetLanguage: jTreeTypes.targetLanguageId): string;
    getErrors(): jTreeTypes.TreeError[];
    getLineHints(): string;
    getParsedWords(): any[];
    readonly cells: jTreeTypes.stringMap;
    protected _getGrammarBackedCellArray(): AbstractGrammarBackedCell<any>[];
    getLineCellTypes(): string;
    getLineHighlightScopes(defaultScope?: string): string;
}
export default AbstractRuntimeNonRootNode;
