import TreeNode from "../base/TreeNode";
import GrammarBackedCell from "./GrammarBackedCell";
import AbstractGrammarDefinitionNode from "./AbstractGrammarDefinitionNode";
import types from "../types";
declare abstract class AbstractRuntimeNode extends TreeNode {
    getGrammarProgram(): any;
    getCatchAllNodeConstructor(line: string): any;
    getProgram(): AbstractRuntimeNode;
    getAutocompleteResults(partialWord: string, wordIndex: types.positiveInt): {
        text: string;
        displayText: string;
    }[];
    protected _getGrammarBackedCellArray(): GrammarBackedCell[];
    getAutocompleteResultsForWord(partialWord: string, wordIndex: types.positiveInt): {
        text: string;
        displayText: string;
    }[];
    getAutocompleteResultsForKeywords(partialWord: string): {
        text: string;
        displayText: string;
    }[];
    abstract getDefinition(): AbstractGrammarDefinitionNode;
    protected _getKeywordDefinitionByName(path: string): AbstractGrammarDefinitionNode;
    protected _getRequiredNodeErrors(errors?: any[]): any[];
}
export default AbstractRuntimeNode;
