import TreeNode from "../base/TreeNode";
import types from "../types";
import AbstractRuntimeProgram from "./AbstractRuntimeProgram";
declare class GrammarCellTypeDefinitionNode extends TreeNode {
    getKeywordMap(): types.stringMap;
    getHighlightScope(): string | undefined;
    private _getEnumOptions;
    private _getKeywordTableOptions;
    getAutocompleteWordOptions(runTimeProgram: AbstractRuntimeProgram): string[];
    getRegexString(): any;
    parse(str: string): any;
    isValid(str: string, runTimeGrammarBackedProgram: any): boolean;
    getId(): string;
    getTypeId(): string;
    static types: any;
}
export default GrammarCellTypeDefinitionNode;
