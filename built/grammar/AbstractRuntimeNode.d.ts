import TreeNode from "../base/TreeNode";
import GrammarProgram from "./GrammarProgram";
import { AbstractGrammarBackedCell } from "./GrammarBackedCell";
import AbstractGrammarDefinitionNode from "./AbstractGrammarDefinitionNode";
import types from "../types";
declare abstract class AbstractRuntimeNode extends TreeNode {
    getGrammarProgram(): GrammarProgram;
    getCatchAllNodeConstructor(line: string): Function;
    getProgram(): AbstractRuntimeNode;
    getAutocompleteResults(partialWord: string, cellIndex: types.positiveInt): {
        text: string;
        displayText: string;
    }[];
    protected _getGrammarBackedCellArray(): AbstractGrammarBackedCell<any>[];
    getRunTimeEnumOptions(cell: AbstractGrammarBackedCell<any>): string[];
    private _getAutocompleteResultsForCell;
    private _getAutocompleteResultsForFirstWord;
    abstract getDefinition(): AbstractGrammarDefinitionNode;
    protected _getNodeTypeDefinitionByName(path: string): AbstractGrammarDefinitionNode;
    protected _getRequiredNodeErrors(errors?: types.ParseError[]): types.ParseError[];
}
export default AbstractRuntimeNode;
