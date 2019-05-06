import TreeNode from "../base/TreeNode";
import types from "../types";
import AbstractRuntimeProgram from "./AbstractRuntimeProgram";
declare class GrammarCellTypeDefinitionNode extends TreeNode {
    getKeywordMap(): types.stringMap;
    getCellConstructor(): any;
    getHighlightScope(): string | undefined;
    private _getEnumOptions;
    private _getEnumFromGrammarOptions;
    getAutocompleteWordOptions(runTimeProgram: AbstractRuntimeProgram): string[];
    getRegexString(): string;
    isValid(str: string, runTimeGrammarBackedProgram: AbstractRuntimeProgram): boolean;
    getCellTypeId(): string;
    static types: any;
}
export default GrammarCellTypeDefinitionNode;
